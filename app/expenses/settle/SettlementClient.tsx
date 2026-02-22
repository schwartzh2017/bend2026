'use client'

import { useState } from 'react'
import SettlementOverview from '@/components/SettlementOverview'
import SettlementTransactions from '@/components/SettlementTransactions'
import PersonExpenseDetail from '@/components/PersonExpenseDetail'

export type SettlementPerson = {
  id: string
  name: string
  color: string
  payment_method: string | null
  payment_handle: string | null
}

export type SettlementBalance = {
  personId: string
  amountCents: number
}

export type SettlementTransaction = {
  from: string
  to: string
  amountCents: number
}

export type SettlementExpense = {
  id: string
  title: string
  amountCents: number
  paidBy: string
  category: string
  date: string
  participants: {
    personId: string
    amountCents: number
  }[]
}

export type SettlementData = {
  people: SettlementPerson[]
  balances: SettlementBalance[]
  simplifiedTransactions: SettlementTransaction[]
  expenses: SettlementExpense[]
}

type Props = {
  data: SettlementData
}

export default function SettlementClient({ data }: Props) {
  const [showTransactions, setShowTransactions] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)

  const peopleMap = new Map(data.people.map((p) => [p.id, p]))

  const selectedPerson = selectedPersonId ? peopleMap.get(selectedPersonId) : null
  const selectedPersonBalance = data.balances.find((b) => b.personId === selectedPersonId)
  const selectedPersonExpenses = selectedPersonId
    ? data.expenses.filter((e) =>
        e.participants.some((p) => p.personId === selectedPersonId)
      )
    : []

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4">
      <div className="max-w-[680px] mx-auto">
        <h1 className="font-[family-name:var(--font-tenor)] text-3xl text-[var(--text-primary)] mb-2">
          Settlement
        </h1>
        <p className="font-[family-name:var(--font-baskerville)] text-[var(--text-muted)] text-sm mb-8">
          Who owes who after all expenses
        </p>

        <SettlementOverview
          people={data.people}
          balances={data.balances}
          onSettleUp={() => setShowTransactions(true)}
          onPersonClick={setSelectedPersonId}
        />
      </div>

      {showTransactions && (
        <SettlementTransactions
          people={data.people}
          onClose={() => setShowTransactions(false)}
        />
      )}

      {selectedPerson && selectedPersonBalance && (
        <PersonExpenseDetail
          person={selectedPerson}
          balance={selectedPersonBalance}
          expenses={selectedPersonExpenses}
          peopleMap={peopleMap}
          onClose={() => setSelectedPersonId(null)}
        />
      )}
    </div>
  )
}
