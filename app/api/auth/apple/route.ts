import { NextRequest, NextResponse } from 'next/server'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import pool from '@/lib/db'
import { signToken, cookieOptions } from '@/lib/auth'
import { z } from 'zod'

const APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'))

const schema = z.object({
  identityToken: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { identityToken } = parsed.data

    // Verify the Apple identity token against Apple's public keys
    let appleSub: string
    let appleEmail: string | undefined

    try {
      const { payload } = await jwtVerify(identityToken, APPLE_JWKS, {
        issuer: 'https://appleid.apple.com',
        audience: 'com.safethedate.app',
      })
      appleSub = payload.sub as string
      console.log('[apple auth] appleSub:', appleSub)
      appleEmail = payload.email as string | undefined
    } catch {
      return NextResponse.json({ error: 'Invalid Apple token.' }, { status: 401 })
    }

    // Ensure apple_sub column exists (safe to run repeatedly)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_sub TEXT UNIQUE`)

    // Find or create user — prefer lookup by apple_sub for returning users
    // (Apple only sends email on the very first sign-in)
    let user: { id: number; email: string; name: string | null }

    const bySubResult = await pool.query<{ id: number; email: string; name: string | null }>(
      `SELECT id, email, name FROM users WHERE apple_sub = $1`,
      [appleSub],
    )

    if (bySubResult.rowCount && bySubResult.rowCount > 0) {
      user = bySubResult.rows[0]
    } else if (appleEmail) {
      // First sign-in: upsert by email and attach apple_sub
      const result = await pool.query<{ id: number; email: string; name: string | null }>(
        `INSERT INTO users (email, apple_sub)
         VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE SET apple_sub = EXCLUDED.apple_sub
         RETURNING id, email, name`,
        [appleEmail.toLowerCase(), appleSub],
      )
      user = result.rows[0]
    } else {
      return NextResponse.json(
        { error: 'Unable to identify Apple account. Please try again.' },
        { status: 400 },
      )
    }

    const isNewUser = !user.name
    const token = await signToken({ userId: String(user.id), email: user.email, name: user.name })

    const response = NextResponse.json({ ok: true, isNewUser, token })
    response.cookies.set('auth_token', token, cookieOptions)
    return response
  } catch (err) {
    console.error('[POST /api/auth/apple]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
