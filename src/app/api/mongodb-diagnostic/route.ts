import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check environment variables
    const mongoUri = process.env.MONGODB_URI
    const jwtSecret = process.env.JWT_SECRET
    
    console.log('=== MONGODB DIAGNOSTIC TEST ===')
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Has MONGODB_URI:', !!mongoUri)
    console.log('Has JWT_SECRET:', !!jwtSecret)
    
    if (mongoUri) {
      console.log('MongoDB URI length:', mongoUri.length)
      console.log('MongoDB URI starts with:', mongoUri.substring(0, 20))
      console.log('MongoDB URI contains cluster:', mongoUri.includes('cluster'))
      console.log('MongoDB URI contains mongodb+srv:', mongoUri.includes('mongodb+srv'))
    }

    // Test 2: Try to import MongoDB
    let mongoImportTest = false
    try {
      const { MongoClient } = await import('mongodb')
      mongoImportTest = true
      console.log('MongoDB import: SUCCESS')
    } catch (importError) {
      console.log('MongoDB import ERROR:', importError)
    }

    // Test 3: Try basic connection (without operations)
    let connectionTest = false
    let connectionError = null
    
    if (mongoUri && mongoImportTest) {
      try {
        const { MongoClient } = await import('mongodb')
        const client = new MongoClient(mongoUri, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        })
        
        console.log('Attempting MongoDB connection...')
        await client.connect()
        console.log('MongoDB connection: SUCCESS')
        
        // Test database access
        const db = client.db('monkeymax')
        const collections = await db.listCollections().toArray()
        console.log('Collections found:', collections.length)
        
        connectionTest = true
        // Don't close in serverless - let it pool
      } catch (connError) {
        connectionError = connError
        console.log('MongoDB connection ERROR:', connError)
      }
    }

    return NextResponse.json({
      success: true,
      tests: {
        environment: process.env.NODE_ENV,
        hasMongoUri: !!mongoUri,
        hasJwtSecret: !!jwtSecret,
        mongoUriLength: mongoUri?.length || 0,
        mongoImportTest,
        connectionTest,
        connectionError: connectionError ? String(connectionError) : null
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.log('DIAGNOSTIC TEST FAILED:', error)
    return NextResponse.json({
      success: false,
      error: String(error),
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}
