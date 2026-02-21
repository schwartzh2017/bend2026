---
name: expense-logic
description: >
  Expense calculation logic, edge case handling, UI decision-making, and settlement
  patterns for the Bend Trip App. Load this skill whenever building or modifying
  anything related to expenses, splits, balances, or the settlement view. Works
  alongside supabase-patterns.md which defines the underlying schema.
---

# Expense Logic Skill — Bend Trip App

This skill defines how the app thinks about, calculates, and presents expenses.
The schema lives in `supabase-patterns.md`. This skill is about behavior, edge
cases, UI decisions, and the reasoning Claude should apply when building any
expense-related feature.

---

## The Two Split Types

Every expense in this app is one of two types. Always determine which type before
writing any split logic.

### Type 1: Participation Split (most expenses)
Used for: food, alcohol, activities, transport, general supplies.

**Rule:** The expense is split evenly among only the people who participated.
Non-participants owe nothing and are not included at all.

**Examples:**
- Dinner out: split among the 7 people who went, not the 3 who stayed back
- Alcohol run: split among the 8 drinkers, not the 1 non-drinker
- Kayak rental: split among the 4 people who kayaked

**Math:**
```
each_share_cents = Math.round(total_cents / participant_count)
```
Rounding note — see Penny Rounding section below.

### Type 2: Lodging Split (nightly proration)
Used for: Airbnb, hotels, any accommodation charged per night.

**Rule:** Split by night-weighted participation. Each person pays for exactly
the nights they are present. The per-night rate is the total cost divided by
the sum of all participant-nights, then multiplied by each person's nights.

**Math:**
```
total_nights = sum of all participants' nights values
nightly_rate_cents = total_cents / total_nights  (keep as float during calculation)
person_share_cents = Math.round(nightly_rate_cents * person_nights)
```

**Example:** $1,600 Airbnb, 4 nights total trip.
- Person A: 4 nights → total_nights contribution: 4
- Person B: 4 nights → total_nights contribution: 4
- Person C: 2 nights → total_nights contribution: 2
- Person D: 2 nights → total_nights contribution: 2
- total_nights = 12
- nightly_rate = 1600/12 = $133.33/night
- Person A owes: Math.round(133.33 * 4) = $533
- Person B owes: Math.round(133.33 * 4) = $533
- Person C owes: Math.round(133.33 * 2) = $267
- Person D owes: Math.round(133.33 * 2) = $267
- Total: $1,600 ✓

**Always verify:** sum of all shares must equal total_cents after rounding
adjustment. Apply any 1-cent remainder to the payer's share (see Penny Rounding).

---

## Penny Rounding

When integer cents don't divide evenly, rounding creates a small remainder.
This app uses **remainder-to-payer** rounding:

```ts
export function distributeEvenly(totalCents: number, count: number): number[] {
  const base = Math.floor(totalCents / count)
  const remainder = totalCents % count
  // Give base to everyone, then add 1 cent to first `remainder` participants
  // Payer is always last in the array so they absorb the least-favorable rounding
  return Array.from({ length: count }, (_, i) =>
    i < remainder ? base + 1 : base
  )
}
```

The practical effect is negligible (never more than a few cents total) but the
implementation must be consistent so balances always sum to exactly zero across
all participants. **Never let rounding cause the books to be off by even 1 cent.**

---

## Balance Calculation

Balances are always calculated in the application layer from raw expense data.
Never store derived balance amounts in the database — always recompute from source.

### Step 1: Build a transaction ledger
For each expense, generate a list of atomic transactions:
```
{ from: person_id, to: paid_by_id, amount_cents: share }
```
The payer does not generate a transaction to themselves — subtract their own
share from what others owe them.

### Step 2: Net all transactions per person
For each person, sum:
- `net_balance = total_owed_to_them - total_they_owe_others`
- Positive net = they are owed money overall
- Negative net = they owe money overall
- Zero = perfectly settled

### Step 3: Simplify to minimum transactions
Use a greedy debt simplification algorithm:
1. Separate people into two lists: creditors (positive balance) and debtors (negative)
2. Sort both lists by absolute value descending
3. Match largest debtor to largest creditor, settle as much as possible
4. Repeat until all balances are zero
5. Result: the fewest number of payments needed to settle all debts

```ts
export function simplifyDebts(
  balances: { personId: string; amount: number }[]
): { from: string; to: string; amount: number }[] {
  const creditors = balances.filter(b => b.amount > 0).sort((a, b) => b.amount - a.amount)
  const debtors = balances.filter(b => b.amount < 0).sort((a, b) => a.amount - b.amount)
  const transactions: { from: string; to: string; amount: number }[] = []

  let i = 0, j = 0
  while (i < debtors.length && j < creditors.length) {
    const debt = Math.abs(debtors[i].amount)
    const credit = creditors[j].amount
    const amount = Math.min(debt, credit)

    transactions.push({ from: debtors[i].personId, to: creditors[j].personId, amount })

    debtors[i].amount += amount
    creditors[j].amount -= amount

    if (debtors[i].amount === 0) i++
    if (creditors[j].amount === 0) j++
  }
  return transactions
}
```

---

## The Settlement UI — Three Levels

The balance screen works as a drill-down with three levels. Always build all three.

### Level 1: Net Balance Overview (default view)
Show every person's net balance at a glance.
- Green + amount = they are owed this much overall
- Sienna/red - amount = they owe this much overall
- Gray $0.00 = settled
- Sort: largest creditor first, then debtors, then settled
- All amounts in JetBrains Mono font (per design skill)
- This is the screen people will check most often

### Level 2: Simplified Settlement (tap "Settle Up")
Show the minimum set of payments to zero everything out.
- Format: "[Person A] → [Person B]: $XX.XX"
- This is what people actually use to send Venmo/cash
- Include a small note: "X payments to settle all debts"
- Never show more complexity than necessary here

### Level 3: Expense Drill-Down (tap any person's name)
Show every expense that person is involved in, with their share for each.
- Group by category
- Show both expenses they paid and expenses they owe on
- Running subtotal at bottom
- This is for when someone says "wait, why do I owe that much?"

---

## Permissions Model

| Action | Who Can Do It |
|---|---|
| View all expenses | Anyone logged in |
| Add a new expense | Anyone logged in |
| Edit an expense | Only the person listed as `paid_by` |
| Delete an expense | Only the person listed as `paid_by` |
| Mark grocery item checked | Anyone |
| Add grocery item | Anyone |

**UI implication:** Always show edit/delete controls, but gate them with an
identity check. When the app has no individual accounts (shared PIN), handle
this by asking "who are you?" on first use and storing their `person_id` in
localStorage. This selection persists for the session and controls edit access.

**Important:** This is social trust, not security. The app trusts users not to
edit each other's expenses. There is no cryptographic enforcement of this at the
DB level — it is enforced in the UI and API route layer only.

---

## Adding People Late

If a person is added to `people` after expenses already exist:
- They appear in the people list immediately
- They are NOT retroactively added to any existing expenses
- The UI should show a warning banner: "X was added after some expenses were
  recorded. Review past expenses to add them where appropriate."
- Provide a workflow: show all existing expenses with a quick-add button to
  include the new person, with their share recalculated on the fly before saving
- Never silently modify existing splits — always require explicit confirmation

---

## Edge Cases Claude Must Handle

**Expense with only one participant (the payer):**
They paid for something just for themselves. No split needed. Net effect: zero
change to anyone else's balance. Still record it for completeness.

**Payer is not a participant:**
Example: one person floats the cash but doesn't partake (e.g. buys alcohol for
the group but doesn't drink). They paid but owe $0. All participants owe their
share back to the payer. This is valid — don't require the payer to be a participant.

**Editing an expense after balances have been viewed:**
Always recompute balances from scratch on every page load. Since balances are
never stored, edits are automatically reflected. Show a subtle "last updated"
timestamp so users know the view is current.

**Zero-amount expense:**
Reject at the form validation level. Amount must be at least $0.01 (1 cent).

**All participants removed from an expense:**
Reject — an expense must have at least one participant.

**Lodging expense with a participant having 0 nights:**
Reject — if nights = 0, they shouldn't be a participant. Remove them instead.

---

## Form UX Guidelines

### Adding an Expense
1. Title (required)
2. Amount in dollars with decimal (convert to cents on save: `Math.round(dollars * 100)`)
3. Category dropdown — defaults to 'general'
4. Paid by — person selector, defaults to the current user's stored identity
5. Split type — "Even split" (default) or "Lodging (by nights)"
6. Participants — checkboxes for all people, all checked by default
   - If lodging: show a nights input next to each checked person
7. Date — defaults to today
8. Optional notes

### Displaying Amounts
- Always use `formatCurrency()` from `/lib/formatCurrency.ts`
- Never show raw cents to users
- In compact views (lists): "$24.50"
- In detailed views: "$24.50" with payer and participant count below
- In balance views: color-coded with + or - prefix

---

## Common Mistakes — Do Not Repeat

- **Never store calculated balances in the DB** — always derive from source expenses
- **Never use floating point for money math** — all intermediate calculations
  should use cents (integers); only divide when absolutely necessary and
  immediately Math.round the result
- **Never split an expense among zero people** — validate before saving
- **Never assume the payer participates** — always check explicitly
- **Never show the simplified settlement without first confirming it sums to zero**
- **Never let a lodging expense have participants with null nights** — nights is
  required for lodging type, optional (and ignored) for all other types