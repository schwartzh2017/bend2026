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
