'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LOCAL_STORAGE_KEYS } from '@/lib/constants'
import { LoadingScreen } from '@/components/LoadingScreen'
import type { Person } from '@/lib/supabase/types'

type PaymentMethod = 'venmo' | 'cashapp' | 'zelle' | null

const PAYMENT_METHOD_LABELS: Record<Exclude<PaymentMethod, null>, string> = {
  venmo: 'Venmo',
  cashapp: 'Cash App',
  zelle: 'Zelle',
}

const PAYMENT_ICONS: Record<Exclude<PaymentMethod, null>, string> = {
  venmo: 'V',
  cashapp: '$',
  zelle: 'Z',
}

export default function SettingsPage() {
  const [people, setPeople] = useState<Person[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('people')
        .select('*')
        .order('name')

      if (fetchError) {
        throw new Error('Failed to load people')
      }

      setPeople(data || [])

      const storedId = localStorage.getItem(LOCAL_STORAGE_KEYS.PERSON_ID)
      setCurrentUserId(storedId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePaymentMethodChange = async (personId: string, method: PaymentMethod) => {
    setIsSaving(personId)
    try {
      const response = await fetch(`/api/people/${personId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: method }),
      })

      if (!response.ok) {
        throw new Error('Failed to update payment method')
      }

      const { data } = await response.json()
      setPeople((prev) =>
        prev.map((p) => (p.id === personId ? { ...p, payment_method: data.payment_method } : p))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(null)
    }
  }

  const handlePaymentHandleChange = async (personId: string, handle: string) => {
    const person = people.find((p) => p.id === personId)
    if (!person) return

    setPeople((prev) =>
      prev.map((p) => (p.id === personId ? { ...p, payment_handle: handle } : p))
    )
  }

  const handlePaymentHandleBlur = async (personId: string) => {
    const person = people.find((p) => p.id === personId)
    if (!person) return

    setIsSaving(personId)
    try {
      const response = await fetch(`/api/people/${personId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_handle: person.payment_handle }),
      })

      if (!response.ok) {
        throw new Error('Failed to update payment handle')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(null)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-[680px] mx-auto p-4">
        <h1
          className="font-[family-name:var(--font-display)] text-3xl mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Settings
        </h1>
        <p
          className="mb-8 text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Payment info for settling expenses. Only you can edit your own info.
        </p>

        {error && (
          <div
            className="mb-4 p-3 rounded-sm border"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--accent-warm)',
              color: 'var(--accent-warm)',
            }}
          >
            {error}
          </div>
        )}

        <div className="space-y-4">
          {people.map((person) => {
            const isCurrentUser = person.id === currentUserId
            const isEditingThis = isSaving === person.id

            return (
              <div
                key={person.id}
                className="p-4 rounded-sm border"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: isCurrentUser ? 'var(--accent-primary)' : 'var(--border)',
                  borderLeftWidth: isCurrentUser ? '4px' : '1px',
                  borderLeftColor: isCurrentUser ? 'var(--accent-primary)' : 'var(--border)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="font-[family-name:var(--font-body)]"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {person.name}
                    {isCurrentUser && (
                      <span
                        className="ml-2 text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        (you)
                      </span>
                    )}
                  </span>
                  {isEditingThis && (
                    <span
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Saving...
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label
                      className="block text-xs mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Payment Method
                    </label>
                    {isCurrentUser ? (
                      <select
                        value={person.payment_method || ''}
                        onChange={(e) =>
                          handlePaymentMethodChange(
                            person.id,
                            (e.target.value as PaymentMethod) || null
                          )
                        }
                        disabled={isEditingThis}
                        className="w-full px-3 py-2 rounded-sm text-sm"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <option value="">Select method</option>
                        {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div
                        className="px-3 py-2 rounded-sm text-sm flex items-center gap-2"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          color: person.payment_method
                            ? 'var(--text-primary)'
                            : 'var(--text-muted)',
                        }}
                      >
                        {person.payment_method && (
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{
                              backgroundColor: 'var(--accent-secondary)',
                              color: 'white',
                            }}
                          >
                            {PAYMENT_ICONS[person.payment_method as Exclude<PaymentMethod, null>]}
                          </span>
                        )}
                        {person.payment_method
                          ? PAYMENT_METHOD_LABELS[person.payment_method as Exclude<PaymentMethod, null>]
                          : 'Not set'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <label
                      className="block text-xs mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Handle / Username
                    </label>
                    {isCurrentUser ? (
                      <input
                        type="text"
                        value={person.payment_handle || ''}
                        onChange={(e) => handlePaymentHandleChange(person.id, e.target.value)}
                        onBlur={() => handlePaymentHandleBlur(person.id)}
                        disabled={isEditingThis}
                        placeholder="@username"
                        className="w-full px-3 py-2 rounded-sm text-sm"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    ) : (
                      <div
                        className="px-3 py-2 rounded-sm text-sm font-[family-name:var(--font-mono)]"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          color: person.payment_handle
                            ? 'var(--text-primary)'
                            : 'var(--text-muted)',
                        }}
                      >
                        {person.payment_handle || 'Not set'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
