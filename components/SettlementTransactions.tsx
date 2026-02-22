'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/formatCurrency'
import { getSettlementStatus } from '@/lib/expenseLogic'
import { LOCAL_STORAGE_KEYS } from '@/lib/constants'
import type { SettlementPerson } from '@/app/expenses/settle/SettlementClient'
import type { Person, Settlement } from '@/lib/supabase/types'

type SettlementWithPeople = Settlement & {
  from_person: Person
  to_person: Person
}

type Props = {
  people: SettlementPerson[]
  onClose: () => void
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  venmo: 'Venmo',
  cashapp: 'Cash App',
  zelle: 'Zelle',
}

export default function SettlementTransactions({ people, onClose }: Props) {
  const [settlements, setSettlements] = useState<SettlementWithPeople[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const storedId = localStorage.getItem(LOCAL_STORAGE_KEYS.PERSON_ID)
    setCurrentUserId(storedId)
  }, [])

  useEffect(() => {
    const loadSettlements = async () => {
      try {
        // Load existing settlements — preserve any confirmation state
        const fetchResponse = await fetch('/api/settlements')
        if (!fetchResponse.ok) throw new Error('Failed to fetch settlements')
        const { data } = await fetchResponse.json()

        // Only generate settlements if none exist yet (first open ever)
        if (!data || data.length === 0) {
          const syncResponse = await fetch('/api/settlements', { method: 'POST' })
          if (!syncResponse.ok) throw new Error('Failed to generate settlements')
          const syncData = await syncResponse.json()
          setSettlements(syncData.data || [])
        } else {
          setSettlements(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    }

    loadSettlements()
  }, [])

  const handleRecalculate = async () => {
    setIsLoading(true)
    setError('')
    try {
      const syncResponse = await fetch('/api/settlements', { method: 'POST' })
      if (!syncResponse.ok) throw new Error('Failed to recalculate')
      const { data } = await syncResponse.json()
      setSettlements(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to recalculate')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async (
    settlementId: string,
    field: 'sender_confirmed' | 'receiver_confirmed',
    value: boolean
  ) => {
    setUpdatingId(settlementId)
    try {
      const response = await fetch(`/api/settlements/${settlementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })

      if (!response.ok) {
        throw new Error('Failed to update')
      }

      const { data } = await response.json()
      setSettlements((prev) =>
        prev.map((s) =>
          s.id === settlementId
            ? { ...s, sender_confirmed: data.sender_confirmed, receiver_confirmed: data.receiver_confirmed }
            : s
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusStyles = (status: 'pending' | 'partial' | 'settled') => {
    switch (status) {
      case 'settled':
        return { borderColor: 'var(--accent-primary)', bgColor: 'rgba(61, 90, 62, 0.1)' }
      case 'partial':
        return { borderColor: 'var(--accent-gold)', bgColor: 'rgba(200, 150, 46, 0.1)' }
      default:
        return { borderColor: 'var(--border)', bgColor: 'var(--bg-card)' }
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-[var(--bg-primary)] p-8 border border-[var(--border)]">
          <p className="text-[var(--text-muted)]">Loading settlements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--bg-primary)] w-full max-w-lg max-h-[85vh] overflow-auto border border-[var(--border)]">
        <div className="sticky top-0 bg-[var(--bg-primary)] border-b border-[var(--border)] p-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-tenor)] text-xl text-[var(--text-primary)]">
            Settle Up
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRecalculate}
              className="text-xs font-[family-name:var(--font-baskerville)] text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
            >
              Recalculate
            </button>
            <button
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-4">
          {error && (
            <p className="text-[var(--accent-warm)] text-sm mb-4">{error}</p>
          )}

          <p className="font-[family-name:var(--font-baskerville)] text-[var(--text-muted)] text-sm mb-6">
            {settlements.length} payment{settlements.length !== 1 ? 's' : ''} to settle all debts
          </p>

          <div className="space-y-3">
            {settlements.map((s) => {
              const status = getSettlementStatus(s.sender_confirmed, s.receiver_confirmed)
              const styles = getStatusStyles(status)
              const isCurrentUserSender = s.from_person_id === currentUserId
              const isCurrentUserReceiver = s.to_person_id === currentUserId
              const isUpdating = updatingId === s.id

              return (
                <div
                  key={s.id}
                  className="p-4 border rounded-sm"
                  style={{
                    backgroundColor: styles.bgColor,
                    borderColor: styles.borderColor,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-[family-name:var(--font-baskerville)] text-sm text-[var(--text-primary)]">
                      <span className="font-medium">{s.from_person.name}</span>
                      <span className="text-[var(--text-muted)]"> → </span>
                      <span className="font-medium">{s.to_person.name}</span>
                    </div>
                    <span className="font-mono text-[var(--text-primary)] font-medium">
                      {formatCurrency(s.amount_cents)}
                    </span>
                  </div>

                  {s.to_person.payment_handle && (
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <span className="text-[var(--text-muted)]">Pay via</span>
                      {s.to_person.payment_method && (
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: 'var(--accent-secondary)',
                            color: 'white',
                          }}
                        >
                          {PAYMENT_METHOD_LABELS[s.to_person.payment_method] || s.to_person.payment_method}
                        </span>
                      )}
                      <span className="font-mono text-[var(--text-primary)]">
                        {s.to_person.payment_handle}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2 border-t border-[var(--border)]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={s.sender_confirmed}
                        disabled={!isCurrentUserSender || isUpdating}
                        onChange={(e) => handleConfirm(s.id, 'sender_confirmed', e.target.checked)}
                        className="w-4 h-4 rounded-sm accent-[var(--accent-primary)]"
                      />
                      <span
                        className="text-xs"
                        style={{
                          color: isCurrentUserSender ? 'var(--text-primary)' : 'var(--text-muted)',
                        }}
                      >
                        Sent
                        {!isCurrentUserSender && s.sender_confirmed && ' ✓'}
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={s.receiver_confirmed}
                        disabled={!isCurrentUserReceiver || isUpdating}
                        onChange={(e) => handleConfirm(s.id, 'receiver_confirmed', e.target.checked)}
                        className="w-4 h-4 rounded-sm accent-[var(--accent-primary)]"
                      />
                      <span
                        className="text-xs"
                        style={{
                          color: isCurrentUserReceiver ? 'var(--text-primary)' : 'var(--text-muted)',
                        }}
                      >
                        Received
                        {!isCurrentUserReceiver && s.receiver_confirmed && ' ✓'}
                      </span>
                    </label>

                    {status === 'settled' && (
                      <span
                        className="ml-auto text-xs font-medium"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        ✓ Settled
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
