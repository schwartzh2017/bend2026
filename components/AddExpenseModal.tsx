'use client'

import { useState, useEffect } from 'react'
import { formatCurrency, dollarsToCents } from '@/lib/formatCurrency'
import { calculateExpenseShares, ParticipantShare } from '@/lib/expenseLogic'
import { createClient } from '@/lib/supabase/client'
import { LOCAL_STORAGE_KEYS } from '@/lib/constants'
import type { Person } from '@/lib/supabase/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onExpenseAdded: () => void
}

const categories = [
  { value: 'general', label: 'General' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'lodging', label: 'Lodging' },
  { value: 'alcohol', label: 'Alcohol' },
  { value: 'transport', label: 'Transportation' },
  { value: 'activities', label: 'Activities' },
]

export default function AddExpenseModal({ isOpen, onClose, onExpenseAdded }: Props) {
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('general')
  const [paidBy, setPaidBy] = useState('')
  const [splitType, setSplitType] = useState<'even' | 'lodging'>('even')
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set())
  const [nightsMap, setNightsMap] = useState<Map<string, number>>(new Map())
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (isOpen) {
      const fetchPeople = async () => {
        const supabase = createClient()
        const { data } = await supabase.from('people').select('*').order('name')
        const typedData = (data as Person[] | null) || []
        if (typedData.length > 0) {
          setPeople(typedData)
          const allIds = new Set(typedData.map((p) => p.id))
          setSelectedParticipants(allIds)

          const defaultNights = new Map(typedData.map((p) => [p.id, p.default_nights ?? 1]))
          setNightsMap(defaultNights)

          const storedPersonId = localStorage.getItem(LOCAL_STORAGE_KEYS.PERSON_ID)
          if (storedPersonId && typedData.some((p) => p.id === storedPersonId)) {
            setPaidBy(storedPersonId)
          } else {
            setPaidBy(typedData[0].id)
          }
        }
      }
      fetchPeople()
    }
  }, [isOpen])

  const amountCents = dollarsToCents(parseFloat(amount) || 0)
  const isLodging = splitType === 'lodging'

  const participantIds = Array.from(selectedParticipants)
  const previewShares: ParticipantShare[] =
    amountCents > 0 && participantIds.length > 0
      ? calculateExpenseShares(
          amountCents,
          participantIds,
          paidBy,
          isLodging,
          isLodging ? nightsMap : null
        )
      : []

  const toggleParticipant = (personId: string) => {
    const newSet = new Set(selectedParticipants)
    if (newSet.has(personId)) {
      if (newSet.size > 1) {
        newSet.delete(personId)
      }
    } else {
      newSet.add(personId)
    }
    setSelectedParticipants(newSet)
  }

  const updateNights = (personId: string, nights: number) => {
    const newMap = new Map(nightsMap)
    newMap.set(personId, Math.max(0, nights))
    setNightsMap(newMap)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (amountCents < 1) {
      setError('Amount must be at least $0.01')
      return
    }

    if (!paidBy) {
      setError('Please select who paid')
      return
    }

    if (selectedParticipants.size === 0) {
      setError('Please select at least one participant')
      return
    }

    if (isLodging) {
      for (const personId of selectedParticipants) {
        const nights = nightsMap.get(personId) ?? 0
        if (nights < 1) {
          setError('All participants must have at least 1 night for lodging expenses')
          return
        }
      }
    }

    setIsLoading(true)

    try {
      const participants = Array.from(selectedParticipants).map((personId) => ({
        person_id: personId,
        nights: isLodging ? nightsMap.get(personId) : undefined,
      }))

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          amount_cents: amountCents,
          paid_by: paidBy,
          category,
          date,
          is_lodging: isLodging,
          participants,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to create expense')
        return
      }

      setTitle('')
      setAmount('')
      setCategory('general')
      setDescription('')
      setDate(new Date().toISOString().split('T')[0])
      setSplitType('even')
      onExpenseAdded()
      onClose()
    } catch (err) {
      setError('Failed to create expense')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-sm shadow-xl"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <div className="sticky top-0 flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <h2
            className="font-[family-name:var(--font-playfair)] text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Add Expense
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-sm text-sm" style={{ backgroundColor: 'var(--error)', color: 'white' }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-sm border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="e.g., Dinner at Deschutes"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-sm border focus:outline-none focus:ring-2 font-mono"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-sm border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-sm border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                Paid by *
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3 py-2 rounded-sm border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              Split type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="splitType"
                  checked={splitType === 'even'}
                  onChange={() => setSplitType('even')}
                  className="w-4 h-4"
                />
                <span style={{ color: 'var(--text-primary)' }}>Even split</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="splitType"
                  checked={splitType === 'lodging'}
                  onChange={() => setSplitType('lodging')}
                  className="w-4 h-4"
                />
                <span style={{ color: 'var(--text-primary)' }}>Lodging (by nights)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              Participants *
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto p-2 rounded-sm border" style={{ borderColor: 'var(--border)' }}>
              {people.map((person) => {
                const isSelected = selectedParticipants.has(person.id)
                const nights = nightsMap.get(person.id) ?? 0

                return (
                  <div key={person.id} className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleParticipant(person.id)}
                        className="w-4 h-4"
                      />
                      <span
                        className="text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {person.name}
                      </span>
                    </label>
                    {isLodging && isSelected && (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={nights}
                          onChange={(e) => updateNights(person.id, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-sm rounded-sm border text-center font-mono"
                          style={{
                            backgroundColor: 'var(--bg-primary)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)',
                          }}
                        />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>nights</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {amountCents > 0 && previewShares.length > 0 && (
            <div
              className="p-3 rounded-sm"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                Split preview
              </p>
              <div className="space-y-1">
                {previewShares.map((share) => {
                  const person = people.find((p) => p.id === share.personId)
                  if (!person) return null

                  return (
                    <div key={share.personId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: person.color }}
                        />
                        <span style={{ color: 'var(--text-secondary)' }}>{person.name}</span>
                      </div>
                      <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(share.amountCents)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
              Notes (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-sm border focus:outline-none focus:ring-2 resize-none"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="Any additional details..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-sm border transition-colors hover:opacity-80"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-sm transition-colors hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'white',
              }}
            >
              {isLoading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
