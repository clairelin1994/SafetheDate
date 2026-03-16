'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SafeButton({ sessionId }: { sessionId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSafe() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/checkins/${sessionId}/safe`, { method: 'PATCH' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong.')
        return
      }
      router.push('/safe-confirmation')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleSafe}
        disabled={loading}
        className="btn-primary w-full text-base py-4 flex items-center justify-center gap-2"
      >
        {loading ? (
          'Confirming…'
        ) : (
          <>
            <span className="text-xl">✅</span> I returned safely
          </>
        )}
      </button>
      {error && <p className="text-rose-500 text-sm text-center">{error}</p>}
    </div>
  )
}
