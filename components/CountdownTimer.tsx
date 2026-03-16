'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  deadline: string // ISO date string
}

interface TimeLeft {
  hours: number
  minutes: number
  seconds: number
  total: number
}

function calculateTimeLeft(deadline: string): TimeLeft {
  const total = new Date(deadline).getTime() - Date.now()
  if (total <= 0) return { hours: 0, minutes: 0, seconds: 0, total: 0 }
  const hours = Math.floor(total / (1000 * 60 * 60))
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((total % (1000 * 60)) / 1000)
  return { hours, minutes, seconds, total }
}

export default function CountdownTimer({ deadline }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(deadline))

  useEffect(() => {
    const tick = setInterval(() => {
      setTimeLeft(calculateTimeLeft(deadline))
    }, 1000)
    return () => clearInterval(tick)
  }, [deadline])

  const isOverdue = timeLeft.total <= 0
  const isUrgent = !isOverdue && timeLeft.total < 30 * 60 * 1000 // < 30 minutes

  if (isOverdue) {
    return (
      <div className="text-center">
        <p className="text-2xl font-bold text-red-500">Deadline passed</p>
        <p className="text-sm text-gray-500 mt-1">Alert emails are being sent to your contacts.</p>
      </div>
    )
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="text-center">
      <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide font-medium">
        Time remaining
      </p>
      <div
        className={`font-mono text-5xl font-bold tracking-tight tabular-nums transition-colors ${
          isUrgent ? 'text-rose-500' : 'text-pink-500'
        }`}
      >
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </div>
      {isUrgent && (
        <p className="text-rose-500 text-sm mt-2 font-medium">Less than 30 minutes left</p>
      )}
    </div>
  )
}
