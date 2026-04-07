import { Pool } from 'pg'

// Reuse the pool across hot-reloads in development
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined
}

function createPool(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    max: 10,
    idleTimeoutMillis: 30_000,
    // Increased to 20s to handle Neon cold-start wake-up latency (can exceed 5s)
    connectionTimeoutMillis: 20_000,
  })
}

const pool: Pool = globalThis._pgPool ?? createPool()

if (process.env.NODE_ENV !== 'production') {
  globalThis._pgPool = pool
}

// Idempotent migrations
pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT').catch((err) => {
  console.error('[db] migration error (name):', err)
})
pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_checkin_at TIMESTAMPTZ').catch((err) => {
  console.error('[db] migration error (last_checkin_at):', err)
})

export default pool
