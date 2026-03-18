import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { sendOtpEmail } from '@/lib/email'
import { loginSchema } from '@/utils/validation'

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

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
    const code = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await pool.query(
      `INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3)`,
      [email, code, expiresAt],
    )

    await sendOtpEmail(email, code)

    return NextResponse.json({ sent: true })
  } catch (err) {
    console.error('[POST /api/auth/login]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
