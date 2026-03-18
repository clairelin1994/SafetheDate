'use client'

interface DeadlineLabelProps {
  deadline: string // ISO date string
}

export default function DeadlineLabel({ deadline }: DeadlineLabelProps) {
  const formatted = new Date(deadline).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  return <>{formatted}</>
}
