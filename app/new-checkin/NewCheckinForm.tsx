'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import DisclaimerBanner from '@/components/DisclaimerBanner'

interface FormState {
  location: string
  withWhom: string
  activityDescription: string
  deadline: string
  contacts: string[]
}

const initialForm: FormState = {
  location: '',
  withWhom: '',
  activityDescription: '',
  deadline: '',
  contacts: [''],
}

interface Props {
  userDisplay?: string
}

export default function NewCheckinForm({ userDisplay }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rateLimited, setRateLimited] = useState(false)

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function setContact(index: number, value: string) {
    setForm((prev) => {
      const contacts = [...prev.contacts]
      contacts[index] = value
      return { ...prev, contacts }
    })
  }

  function addContact() {
    if (form.contacts.length < 3) {
      setForm((prev) => ({ ...prev, contacts: [...prev.contacts, ''] }))
    }
  }

  function removeContact(index: number) {
    if (form.contacts.length === 1) return
    setForm((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const filledContacts = form.contacts.filter((c) => c.trim() !== '')
    if (filledContacts.length === 0) {
      setError('Please add at least one emergency contact.')
      return
    }

    setLoading(true)
    setRateLimited(false)
    try {
      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: form.location || undefined,
          withWhom: form.withWhom || undefined,
          activityDescription: form.activityDescription || undefined,
          deadline: new Date(form.deadline).toISOString(),
          emergencyContacts: filledContacts,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          setRateLimited(true)
        } else {
          setError(data.error || 'Failed to create check-in.')
        }
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Default deadline: 3 hours from now, rounded to nearest 15 min
  function defaultDeadline(): string {
    const d = new Date(Date.now() + 3 * 60 * 60 * 1000)
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0)
    return d.toISOString().slice(0, 16)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userDisplay={userDisplay} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">New Check-in</h1>
          <p className="text-gray-500 mt-1">
            {userDisplay
              ? `Hey ${userDisplay.split(' ')[0]}, fill in your details before you head out.`
              : 'Fill in your details before you head out.'}
          </p>
        </div>

        <DisclaimerBanner />

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Activity details */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-700 text-lg">Activity Details</h2>

            <div>
              <label htmlFor="location" className="label">
                Location <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g. Griffith Park, Joe's Coffee Shop"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                maxLength={200}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="withWhom" className="label">
                With whom <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="withWhom"
                type="text"
                placeholder="e.g. John, met on Hinge"
                value={form.withWhom}
                onChange={(e) => set('withWhom', e.target.value)}
                maxLength={100}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="activityDescription" className="label">
                Activity <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="activityDescription"
                placeholder="e.g. Dinner date, then maybe drinks"
                value={form.activityDescription}
                onChange={(e) => set('activityDescription', e.target.value)}
                maxLength={500}
                rows={3}
                className="input-field resize-none"
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="card">
            <h2 className="font-semibold text-gray-700 text-lg mb-4">Return Deadline</h2>
            <div>
              <label htmlFor="deadline" className="label">
                I expect to be safe by <span className="text-rose-500">*</span>
              </label>
              <input
                id="deadline"
                type="datetime-local"
                required
                min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                defaultValue={defaultDeadline()}
                onChange={(e) => set('deadline', e.target.value)}
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                If you haven't confirmed by this time, your contacts will be notified.
              </p>
            </div>
          </div>

          {/* Emergency contacts */}
          <div className="card">
            <h2 className="font-semibold text-gray-700 text-lg mb-1">Emergency Contacts</h2>
            <p className="text-sm text-gray-400 mb-4">
              Add 1–3 people to notify if you don't check in on time.
            </p>

            <div className="space-y-3">
              {form.contacts.map((contact, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder={`Contact ${i + 1} email`}
                    value={contact}
                    onChange={(e) => setContact(i, e.target.value)}
                    className="input-field"
                  />
                  {form.contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(i)}
                      className="text-gray-400 hover:text-rose-400 transition-colors px-2 flex-shrink-0"
                      aria-label="Remove contact"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {form.contacts.length < 3 && (
              <button
                type="button"
                onClick={addContact}
                className="mt-3 text-pink-500 hover:text-pink-700 text-sm font-medium transition-colors"
              >
                + Add another contact
              </button>
            )}
          </div>

          {rateLimited && (
            <div className="bg-pink-50 border border-pink-200 rounded-xl px-5 py-4 text-center">
              <p className="text-2xl mb-2">🌸</p>
              <p className="font-semibold text-pink-700 text-base mb-1">
                You've used your free check-in this week.
              </p>
              <p className="text-pink-600 text-sm">
                Download the <strong>Safe the Date</strong> app for unlimited check-ins!
              </p>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-600 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || rateLimited} className="btn-primary w-full text-base py-4">
            {loading ? 'Creating check-in…' : '🌸 Start Check-in'}
          </button>
        </form>
      </main>
    </div>
  )
}
