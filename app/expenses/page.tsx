'use client'

import { useState, useEffect, useCallback } from 'react'
import ExpenseList from '@/components/ExpenseList'
import AddExpenseModal from '@/components/AddExpenseModal'
import { LoadingScreen } from '@/components/LoadingScreen'
import type { Expense, ExpenseParticipant, Person } from '@/lib/supabase/types'

type ExpenseWithRelations = Expense & {
  paid_by: Person
  expense_participants: (ExpenseParticipant & { person: Person })[]
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await fetch('/api/expenses')
      if (!response.ok) {
        throw new Error('Failed to fetch expenses')
      }
      const data = await response.json()
      setExpenses(data.data || [])
    } catch (err) {
      setError('Failed to load expenses')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const handleExpenseAdded = () => {
    fetchExpenses()
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-[680px] mx-auto p-4">
        <div className="flex items-center justify-between mb-8">
          <h1
            className="font-[family-name:var(--font-playfair)] font-black text-3xl"
            style={{ color: 'var(--text-primary)' }}
          >
            Expenses
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-sm transition-colors hover:opacity-90 flex items-center gap-2"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Expense</span>
          </button>
        </div>

        {error ? (
          <div className="text-center py-12">
            <p style={{ color: 'var(--error)' }}>{error}</p>
            <button
              onClick={fetchExpenses}
              className="mt-4 px-4 py-2 rounded-sm border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <ExpenseList expenses={expenses} />
        )}
      </div>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExpenseAdded={handleExpenseAdded}
      />
    </div>
  )
}
