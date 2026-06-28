import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

export interface AuthUser {
  userId: string
  firstName?: string
  username?: string
  phone?: string
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const token = request.cookies.get('token')?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser & { userId: string }
    return {
      userId: decoded.userId,
      firstName: decoded.firstName,
      username: decoded.username,
      phone: decoded.phone,
    }
  } catch {
    return null
  }
}

export function requireAuth(request: NextRequest): AuthUser | null {
  return getAuthUser(request)
}
