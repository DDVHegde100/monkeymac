import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/monkeymax'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing MongoDB connection...')
    console.log('MongoDB URI available:', !!process.env.MONGODB_URI)
    console.log('MongoDB URI length:', process.env.MONGODB_URI?.length || 0)
    console.log('Node environment:', process.env.NODE_ENV)

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db('monkeymax')
    
    // Test database connection
    const collections = await db.listCollections().toArray()
    console.log('Collections found:', collections.map(c => c.name))
    
    await client.close()

    return NextResponse.json(
      { 
        success: true,
        message: 'MongoDB connection successful',
        collections: collections.map(c => c.name),
        hasMongoUri: !!process.env.MONGODB_URI,
        environment: process.env.NODE_ENV
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('MongoDB connection test failed:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        success: false,
        error: 'MongoDB connection failed',
        details: String(error),
        hasMongoUri: !!process.env.MONGODB_URI,
        environment: process.env.NODE_ENV
      },
      { status: 500 }
    )
  }
}
