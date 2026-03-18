'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  userDisplay?: string
}

export default function Header({ userDisplay }: HeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-pink-100 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <span className="font-semibold text-gray-800 text-lg tracking-tight">
            Safe the Date
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {userDisplay ? (
            <>
              <span className="text-sm text-gray-500 hidden sm:block">{userDisplay}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-pink-500 hover:text-pink-700 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm text-pink-500 hover:text-pink-700 transition-colors font-medium"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
