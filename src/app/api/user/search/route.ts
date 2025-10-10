import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../../../lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const { db } = await connectToDatabase()
    
    const tests = db.collection('test_results')
    const { searchParams } = new URL(request.url)

    // Advanced filtering parameters
    const query = searchParams.get('query') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const difficulty = searchParams.get('difficulty')
    const duration = searchParams.get('duration')
    const operation = searchParams.get('operation')
    const scoreMin = searchParams.get('scoreMin')
    const scoreMax = searchParams.get('scoreMax')
    const accuracyMin = searchParams.get('accuracyMin')
    const accuracyMax = searchParams.get('accuracyMax')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const tags = searchParams.get('tags')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build MongoDB query
    const mongoQuery: any = { userId: new ObjectId(decoded.userId) }

    // Text search in problem types or notes (if we had them)
    if (query) {
      mongoQuery.$or = [
        { difficulty: { $regex: query, $options: 'i' } },
        { operations: { $in: [new RegExp(query, 'i')] } }
      ]
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'all') {
      mongoQuery.difficulty = difficulty
    }

    // Duration filter
    if (duration && duration !== 'all') {
      mongoQuery.duration = parseInt(duration)
    }

    // Operation filter
    if (operation && operation !== 'all') {
      mongoQuery.operations = operation
    }

    // Score range
    if (scoreMin || scoreMax) {
      mongoQuery.score = {}
      if (scoreMin) mongoQuery.score.$gte = parseFloat(scoreMin)
      if (scoreMax) mongoQuery.score.$lte = parseFloat(scoreMax)
    }

    // Accuracy range
    if (accuracyMin || accuracyMax) {
      mongoQuery.accuracy = {}
      if (accuracyMin) mongoQuery.accuracy.$gte = parseFloat(accuracyMin)
      if (accuracyMax) mongoQuery.accuracy.$lte = parseFloat(accuracyMax)
    }

    // Date range
    if (startDate || endDate) {
      mongoQuery.createdAt = {}
      if (startDate) mongoQuery.createdAt.$gte = new Date(startDate)
      if (endDate) {
        const endDateObj = new Date(endDate)
        endDateObj.setHours(23, 59, 59, 999) // End of day
        mongoQuery.createdAt.$lte = endDateObj
      }
    }

    // Tags filter (if we implement tagging later)
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim())
      mongoQuery.tags = { $in: tagArray }
    }

    // Build sort criteria
    const sortCriteria: any = {}
    sortCriteria[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute query
    const totalCount = await tests.countDocuments(mongoQuery)
    const results = await tests
      .find(mongoQuery)
      .sort(sortCriteria)
      .skip(offset)
      .limit(limit)
      .toArray()

    // Get available filter options
    const filterOptions = await getFilterOptions(decoded.userId, db)

    // Calculate search statistics
    const searchStats = calculateSearchStats(results)

    return NextResponse.json({
      results: results.map(test => ({
        _id: test._id,
        score: test.score,
        accuracy: test.accuracy,
        correctAnswers: test.correctAnswers,
        totalProblems: test.totalProblems,
        difficulty: test.difficulty,
        duration: test.duration,
        problemsPerMinute: test.problemsPerMinute,
        operations: test.operations || [],
        createdAt: test.createdAt,
        restartCount: test.restartCount || 0,
        timeSpent: test.timeSpent || test.duration
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      filterOptions,
      searchStats,
      appliedFilters: {
        query,
        sortBy,
        sortOrder,
        difficulty,
        duration,
        operation,
        scoreMin,
        scoreMax,
        accuracyMin,
        accuracyMax,
        startDate,
        endDate,
        tags
      }
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getFilterOptions(userId: ObjectId, db: any) {
  const tests = db.collection('test_results')
  
  // Get unique values for filter dropdowns
  const pipeline = [
    { $match: { userId } },
    {
      $group: {
        _id: null,
        difficulties: { $addToSet: '$difficulty' },
        durations: { $addToSet: '$duration' },
        operations: { $addToSet: { $arrayElemAt: ['$operations', 0] } },
        minScore: { $min: '$score' },
        maxScore: { $max: '$score' },
        minAccuracy: { $min: '$accuracy' },
        maxAccuracy: { $max: '$accuracy' },
        minDate: { $min: '$createdAt' },
        maxDate: { $max: '$createdAt' }
      }
    }
  ]

  const result = await tests.aggregate(pipeline).toArray()
  
  if (result.length === 0) {
    return {
      difficulties: [],
      durations: [],
      operations: [],
      scoreRange: { min: 0, max: 100 },
      accuracyRange: { min: 0, max: 100 },
      dateRange: { min: new Date(), max: new Date() }
    }
  }

  const data = result[0]
  
  return {
    difficulties: data.difficulties.filter(Boolean).sort(),
    durations: data.durations.filter(Boolean).sort((a: number, b: number) => a - b),
    operations: data.operations.filter(Boolean).sort(),
    scoreRange: {
      min: Math.floor(data.minScore || 0),
      max: Math.ceil(data.maxScore || 100)
    },
    accuracyRange: {
      min: Math.floor(data.minAccuracy || 0),
      max: Math.ceil(data.maxAccuracy || 100)
    },
    dateRange: {
      min: data.minDate,
      max: data.maxDate
    }
  }
}

function calculateSearchStats(results: any[]) {
  if (results.length === 0) {
    return {
      totalTests: 0,
      averageScore: 0,
      averageAccuracy: 0,
      bestScore: 0,
      worstScore: 0,
      difficultyDistribution: {},
      durationDistribution: {}
    }
  }

  const scores = results.map(r => r.score || 0)
  const accuracies = results.map(r => r.accuracy || 0)

  // Calculate distributions
  const difficultyDistribution = results.reduce((dist, test) => {
    dist[test.difficulty] = (dist[test.difficulty] || 0) + 1
    return dist
  }, {} as Record<string, number>)

  const durationDistribution = results.reduce((dist, test) => {
    const duration = test.duration.toString()
    dist[duration] = (dist[duration] || 0) + 1
    return dist
  }, {} as Record<string, number>)

  return {
    totalTests: results.length,
    averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    averageAccuracy: accuracies.reduce((a, b) => a + b, 0) / accuracies.length,
    bestScore: Math.max(...scores),
    worstScore: Math.min(...scores),
    difficultyDistribution,
    durationDistribution
  }
}
