import Link from 'next/link'
import Header from '@/components/Header'
import { getAuthUser } from '@/lib/auth'

export default async function SafeConfirmationPage() {
  const user = await getAuthUser()
  const displayName = user ? (user.name || user.email) : undefined

  return (
    <div className="min-h-screen flex flex-col">
      <Header userDisplay={displayName} />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">🌸</div>

          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Session closed.
          </h1>
          <h2 className="text-2xl font-semibold text-pink-500 mb-4">
            Glad you're safe!
          </h2>

          <p className="text-gray-500 leading-relaxed mb-8">
            Your check-in has been marked as completed and your emergency contacts
            will not be notified. Take care of yourself out there 💕
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/new-checkin" className="btn-primary inline-flex items-center justify-center">
              Start a New Check-in
            </Link>
            <Link href="/" className="btn-secondary inline-flex items-center justify-center">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
