import Link from 'next/link'
import Header from '@/components/Header'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import { getAuthUser } from '@/lib/auth'

export default async function HomePage() {
  const user = await getAuthUser()

  const steps = [
    {
      icon: '📝',
      title: 'Fill in your details',
     desc: "Enter your location, who you're with, and when you expect to return.",
    },
    {
      icon: '📧',
      title: 'Add emergency contacts',
      desc: 'Add 1–3 trusted people who should be notified if you do not check in.',
    },
    {
      icon: '✅',
      title: 'Confirm when you are safe',
      desc: 'Tap "I returned safely" before the deadline and the session closes quietly.',
    },
    {
      icon: '🚨',
      title: 'Automatic alert if you do not',
      desc: 'If the deadline passes with no confirmation, your contacts receive an email.',
    },
  ]

  const useCases = [
    { icon: '🌃', label: 'First dates' },
    { icon: '🏃‍♀️', label: 'Night runs' },
    { icon: '🚗', label: 'Rideshares' },
    { icon: '👤', label: 'Meeting strangers' },
    { icon: '🌲', label: 'Solo hikes' },
    { icon: '🏠', label: 'Visiting new places' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header userEmail={user?.email} />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-4 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span>🌸</span> Free personal safety tool
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Stay safe. <span className="text-pink-500">Let someone know.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
            Before a date, night run, or any moment that feels uncertain — set a check-in. If you
            don't confirm you are safe by your deadline, your trusted contacts are automatically
            notified.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={user ? '/new-checkin' : '/login'}
              className="btn-primary text-base inline-flex items-center justify-center gap-2"
            >
              🌸 Start a Check-in
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="btn-secondary text-base inline-flex items-center justify-center gap-2"
              >
                View Dashboard
              </Link>
            )}
          </div>
        </section>

        {/* Use cases */}
        <section className="max-w-3xl mx-auto px-4 pb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {useCases.map(({ icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 bg-white border border-pink-100 text-gray-700 text-sm px-4 py-2 rounded-full shadow-sm"
              >
                {icon} {label}
              </span>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-3xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">How it works</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {steps.map((step, i) => (
              <div key={i} className="card flex gap-4 items-start">
                <div className="text-3xl flex-shrink-0">{step.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="max-w-3xl mx-auto px-4 pb-16">
          <DisclaimerBanner />
        </section>
      </main>

      <footer className="text-center text-sm text-gray-400 py-6 border-t border-pink-100 bg-white">
        Safe the Date! · A personal reminder tool, not an emergency service
      </footer>
    </div>
  )
}
