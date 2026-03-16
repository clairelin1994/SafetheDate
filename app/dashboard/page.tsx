import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthUser } from '@/lib/auth'
import pool from '@/lib/db'
import Header from '@/components/Header'
import CountdownTimer from '@/components/CountdownTimer'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import SafeButton from './SafeButton'

interface Session {
  id: number
  location: string | null
  with_whom: string | null
  activity_description: string | null
  deadline: string
  status: string
  created_at: string
  contacts: string[]
}

async function getActiveSession(userId: number): Promise<Session | null> {
  const result = await pool.query<Session>(
    `SELECT
       s.id, s.location, s.with_whom, s.activity_description,
       s.deadline, s.status, s.created_at,
       ARRAY_AGG(c.email) AS contacts
     FROM sessions s
     LEFT JOIN contacts c ON c.session_id = s.id
     WHERE s.user_id = $1 AND s.status = 'active'
     GROUP BY s.id
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [userId],
  )
  return result.rows[0] ?? null
}

export default async function DashboardPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const session = await getActiveSession(user.userId)

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header userEmail={user.email} />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-16 text-center">
          <div className="text-6xl mb-4">🌸</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">No active check-in</h1>
          <p className="text-gray-500 mb-8">Create a check-in before heading out.</p>
          <Link href="/new-checkin" className="btn-primary inline-flex">
            Start a Check-in
          </Link>
        </main>
      </div>
    )
  }

  const deadline = new Date(session.deadline).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header userEmail={user.email} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        {/* Status badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Active Check-in
          </span>
        </div>

        {/* Countdown */}
        <div className="card text-center mb-6 py-10">
          <CountdownTimer deadline={session.deadline} />
          <p className="text-sm text-gray-400 mt-4">
            Deadline: <span className="text-gray-600 font-medium">{deadline}</span>
          </p>
        </div>

        {/* Details */}
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-700 text-lg mb-4">Check-in Details</h2>
          <dl className="space-y-3 text-sm">
            {session.location && (
              <div className="flex gap-3">
                <dt className="text-gray-400 w-24 flex-shrink-0">Location</dt>
                <dd className="text-gray-800 font-medium">{session.location}</dd>
              </div>
            )}
            {session.with_whom && (
              <div className="flex gap-3">
                <dt className="text-gray-400 w-24 flex-shrink-0">With</dt>
                <dd className="text-gray-800 font-medium">{session.with_whom}</dd>
              </div>
            )}
            {session.activity_description && (
              <div className="flex gap-3">
                <dt className="text-gray-400 w-24 flex-shrink-0">Activity</dt>
                <dd className="text-gray-800 font-medium">{session.activity_description}</dd>
              </div>
            )}
            <div className="flex gap-3">
              <dt className="text-gray-400 w-24 flex-shrink-0">Contacts</dt>
              <dd className="text-gray-800 font-medium">
                {session.contacts.filter(Boolean).join(', ')}
              </dd>
            </div>
          </dl>
        </div>

        {/* Safe button */}
        <SafeButton sessionId={session.id} />

        <div className="mt-6">
          <DisclaimerBanner />
        </div>
      </main>
    </div>
  )
}
