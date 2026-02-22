'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LOCAL_STORAGE_KEYS } from '@/lib/constants'
import type { Person } from '@/lib/supabase/types'

type Props = {
  onItemAdded: () => void
}

const categories = [
  { value: 'produce', label: 'Produce' },
  { value: 'protein', label: 'Protein' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'drinks', label: 'Drinks' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'alcohol', label: 'Alcohol' },
  { value: 'other', label: 'Other' },
]

export default function AddGroceryForm({ onItemAdded }: Props) {
  const [people, setPeople] = useState<Person[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [category, setCategory] = useState('produce')
  const [requestedBy, setRequestedBy] = useState('')
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const fetchPeople = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('people').select('*').order('name')
      const typedData = (data as Person[] | null) || []
      setPeople(typedData)

      const storedPersonId = localStorage.getItem(LOCAL_STORAGE_KEYS.PERSON_ID)
      if (storedPersonId && typedData.some((p) => p.id === storedPersonId)) {
        setRequestedBy(storedPersonId)
      } else if (typedData.length > 0) {
        setRequestedBy(typedData[0].id)
      }
    }
    fetchPeople()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    setSubmitError('')
    try {
      const response = await fetch('/api/grocery-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          quantity: quantity.trim() || undefined,
          category,
          requested_by: requestedBy || undefined,
        }),
      })

      if (response.ok) {
        setName('')
        setQuantity('')
        setCategory('produce')
        setIsOpen(false)
        onItemAdded()
      } else {
        setSubmitError('Failed to add item. Please try again.')
      }
    } catch (error) {
      console.error('Failed to add item:', error)
      setSubmitError('Failed to add item. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-4 rounded-sm border-2 border-dashed transition-colors hover:border-[var(--accent-primary)] hover:bg-[var(--bg-secondary)]"
        style={{
          borderColor: 'var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        <span className="flex items-center justify-center gap-2">
          <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add item
        </span>
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded-sm border space-y-3"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3
          className="font-[family-name:var(--font-tenor)] font-bold text-sm uppercase tracking-[0.1em]"
          style={{ color: 'var(--text-secondary)' }}
        >
          Add Item
        </h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="p-1 hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Close add item form"
        >
          <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          className="px-3 py-2 rounded-sm border focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
          autoFocus
        />
        <input
          type="text"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Qty"
          className="w-20 px-3 py-2 rounded-sm border focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] font-mono text-sm"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded-sm border focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
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

        <select
          value={requestedBy}
          onChange={(e) => setRequestedBy(e.target.value)}
          className="px-3 py-2 rounded-sm border focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">Who's asking?</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </div>

      {submitError && (
        <p className="text-xs" style={{ color: 'var(--error)' }}>
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="w-full py-2 rounded-sm transition-colors hover:opacity-90 disabled:opacity-50"
        style={{
          backgroundColor: 'var(--accent-primary)',
          color: 'white',
        }}
      >
        {isLoading ? 'Adding...' : 'Add'}
      </button>
    </form>
  )
}
