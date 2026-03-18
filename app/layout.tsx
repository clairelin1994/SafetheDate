import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Safe the Date — Personal Safety Check-In',
  description: "A personal safety check-in tool. Set a return deadline and emergency contacts — we notify them if you don't check in on time.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
        {children}
      </body>
    </html>
  )
}
