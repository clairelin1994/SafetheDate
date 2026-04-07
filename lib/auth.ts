import { SignJWT, jwtVerify } from 'jose'
import { cookies, headers } from 'next/headers'

const getSecret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-key')

export interface JWTPayload {
  userId: string
  email: string
  name?: string | null
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret())

}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function getAuthUser(): Promise<JWTPayload | null> {
  // Check Authorization: Bearer <token> header first (used by mobile clients)
  const headerStore = await headers()
  const authorization = headerStore.get('authorization')
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.slice(7)
    return verifyToken(token)
  }

  // Fall back to cookie (used by web clients)
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return null
  return verifyToken(token)
}
