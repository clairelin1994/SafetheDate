import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { signToken, cookieOptions } from '@/lib/auth'
import { z } from 'zod'

const verifySchema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().length(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = verifySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      )
    }
    const { email, code } = parsed.data

    const otpResult = await pool.query<{ id: number }>(
      `SELECT id FROM otp_codes
       WHERE email = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [email, code],
    )

    if (otpResult.rowCount === 0) {
      return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 401 })
    }

    await pool.query(`UPDATE otp_codes SET used = TRUE WHERE id = $1`, [otpResult.rows[0].id])

    const userResult = await pool.query<{ id: number; email: string; name: string | null }>(
      `INSERT INTO users (email)
       VALUES ($1)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id, email, name`,
      [email],
    )
    const user = userResult.rows[0]

    const token = await signToken({ userId: String(user.id), email: user.email, name: user.name })
    const response = NextResponse.json({ ok: true, needsName: !user.name })
    response.cookies.set('auth_token', token, cookieOptions)
    return response
  } catch (err) {
    console.error('[POST /api/auth/verify-otp]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
