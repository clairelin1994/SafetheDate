import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const result = await pool.query<{ is_premium: boolean; premium_expires_at: string | null; apple_sub: string | null }>(
      'SELECT is_premium, premium_expires_at, apple_sub FROM users WHERE id = $1',
      [user.userId],
    )
    const row = result.rows[0]
    const now = new Date()
    const isPremium =
      row?.is_premium === true &&
      (!row.premium_expires_at || new Date(row.premium_expires_at) > now)
    const hasAppleSub = !!row?.apple_sub
    console.log('[auth/me] userId:', user.userId, '| hasAppleSub:', !!user.appleSub, '| isPremium:', isPremium, '| hasAppleSub in db:', hasAppleSub)

    return NextResponse.json({ isPremium, hasAppleSub })
  } catch (err) {
    console.error('[GET /api/auth/me]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}