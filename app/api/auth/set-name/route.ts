import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getAuthUser, signToken, cookieOptions } from '@/lib/auth'
import { z } from 'zod'

const nameSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).trim(),
})

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = nameSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { name } = parsed.data
    await pool.query(`UPDATE users SET name = $1 WHERE id = $2`, [name, user.userId])

    const token = await signToken({ userId: user.userId, email: user.email, name })
    const response = NextResponse.json({ ok: true })
    response.cookies.set('auth_token', token, cookieOptions)
    return response
  } catch (err) {
    console.error('[POST /api/auth/set-name]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
