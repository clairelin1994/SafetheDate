import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const maxDuration = 10

export async function GET() {
  try {
    await pool.query('SELECT 1')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}