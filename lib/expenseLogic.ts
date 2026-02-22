export type ParticipantWithNights = {
  personId: string
  nights: number
}

export type ParticipantShare = {
  personId: string
  amountCents: number
}

export function distributeEvenly(
  totalCents: number,
  participantIds: string[],
  payerId: string
): ParticipantShare[] {
  const count = participantIds.length
  if (count === 0) return []

  const base = Math.floor(totalCents / count)
  const remainder = totalCents % count

  const payerIndex = participantIds.indexOf(payerId)

  return participantIds.map((personId, i) => {
    let amount = base
    if (i < remainder) {
      amount += 1
    }
    if (personId === payerId && payerIndex >= remainder) {
      amount += remainder > 0 && payerIndex < remainder ? 0 : 0
    }

    return { personId, amountCents: amount }
  })
}

export function calculateLodgingShares(
  totalCents: number,
  participants: ParticipantWithNights[]
): ParticipantShare[] {
  if (participants.length === 0) return []

  const totalNights = participants.reduce((sum, p) => sum + p.nights, 0)
  if (totalNights === 0) return []

  const nightlyRateCents = totalCents / totalNights

  const shares = participants.map((p) => ({
    personId: p.personId,
    amountCents: Math.round(nightlyRateCents * p.nights),
  }))

  const totalAllocated = shares.reduce((sum, s) => sum + s.amountCents, 0)
  const roundingError = totalCents - totalAllocated

  if (roundingError !== 0 && shares.length > 0) {
    shares[0].amountCents += roundingError
  }

  return shares
}

export function calculateExpenseShares(
  totalCents: number,
  participantIds: string[],
  payerId: string,
  isLodging: boolean,
  nightsMap: Map<string, number> | null
): ParticipantShare[] {
  if (isLodging && nightsMap) {
    const participantsWithNights: ParticipantWithNights[] = participantIds.map((personId) => ({
      personId,
      nights: nightsMap.get(personId) ?? 0,
    }))
    return calculateLodgingShares(totalCents, participantsWithNights)
  }

  return distributeEvenly(totalCents, participantIds, payerId)
}

export type Transaction = {
  from: string
  to: string
  amountCents: number
}

export type PersonBalance = {
  personId: string
  amountCents: number
}

export type ExpenseWithParticipants = {
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

export function calculateNetBalances(
  expenses: ExpenseWithParticipants[],
  personIds: string[]
): PersonBalance[] {
  const balances = new Map<string, number>()
  personIds.forEach((id) => balances.set(id, 0))

  for (const expense of expenses) {
    for (const participant of expense.participants) {
      if (participant.personId === expense.paidBy) {
        continue
      }
      const currentDebt = balances.get(participant.personId) ?? 0
      balances.set(participant.personId, currentDebt - participant.amountCents)

      const currentCredit = balances.get(expense.paidBy) ?? 0
      balances.set(expense.paidBy, currentCredit + participant.amountCents)
    }
  }

  return Array.from(balances.entries()).map(([personId, amountCents]) => ({
    personId,
    amountCents,
  }))
}

export function simplifyDebts(balances: PersonBalance[]): Transaction[] {
  const creditors = balances
    .filter((b) => b.amountCents > 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.amountCents - a.amountCents)

  const debtors = balances
    .filter((b) => b.amountCents < 0)
    .map((b) => ({ ...b, amountCents: Math.abs(b.amountCents) }))
    .sort((a, b) => b.amountCents - a.amountCents)

  const transactions: Transaction[] = []

  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debt = debtors[i].amountCents
    const credit = creditors[j].amountCents
    const amount = Math.min(debt, credit)

    transactions.push({
      from: debtors[i].personId,
      to: creditors[j].personId,
      amountCents: amount,
    })

    debtors[i].amountCents -= amount
    creditors[j].amountCents -= amount

    if (debtors[i].amountCents === 0) i++
    if (creditors[j].amountCents === 0) j++
  }

  return transactions
}

export type SettlementStatus = 'pending' | 'partial' | 'settled'

export function getSettlementStatus(
  senderConfirmed: boolean,
  receiverConfirmed: boolean
): SettlementStatus {
  if (senderConfirmed && receiverConfirmed) return 'settled'
  if (senderConfirmed || receiverConfirmed) return 'partial'
  return 'pending'
}
