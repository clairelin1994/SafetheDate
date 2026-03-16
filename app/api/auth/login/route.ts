import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { signToken, cookieOptions } from '@/lib/auth'
import { loginSchema } from '@/utils/validation'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      )
    }

    const { email } = parsed.data

    // Find or create user
    const result = await pool.query<{ id: number; email: string }>(
      `INSERT INTO users (email)
       VALUES ($1)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id, email`,
      [email],
    )

    const user = result.rows[0]
    const token = signToken({ userId: user.id, email: user.email })

    const response = NextResponse.json({ ok: true })
    response.cookies.set({
      ...cookieOptions,
      value: token,
    })

    return response
  } catch (err) {
    console.error('[POST /api/auth/login]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
