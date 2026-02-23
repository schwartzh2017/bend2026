export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { LOCAL_STORAGE_KEYS } from '@/lib/constants'
import CountdownCard from '@/components/CountdownCard'
import UpcomingEventsCard from '@/components/UpcomingEventsCard'
import BalanceCard from '@/components/BalanceCard'
import GroceriesCard from '@/components/GroceriesCard'
import SecretAssignmentCard from '@/components/SecretAssignmentCard'
import { getHomePageData } from '@/lib/homePageData'

export default async function HomePage() {
  const cookieStore = await cookies()
  const personId = cookieStore.get(LOCAL_STORAGE_KEYS.PERSON_ID)?.value ?? null

  const data = await getHomePageData(personId)

  const SHOW_SECRET_ASSIGNMENT_DATE = new Date('2026-02-26T00:00:00-08:00')
  const showSecretAssignment =
    data.secretAssignment && new Date() >= SHOW_SECRET_ASSIGNMENT_DATE

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-[680px] mx-auto p-4 space-y-4">
        <CountdownCard tripStartDate={data.tripStartDate} />
        {showSecretAssignment && data.secretAssignment && (
          <SecretAssignmentCard
            assignedPersonName={data.secretAssignment.assignedPersonName}
            assignedWord={data.secretAssignment.assignedWord}
          />
        )}
        <UpcomingEventsCard events={data.upcomingEvents} />
        <BalanceCard
          personId={data.personId}
          balanceCents={data.balanceCents}
          myTransactions={data.myTransactions}
        />
        <GroceriesCard items={data.recentGroceries} />
      </div>
    </div>
  )
}
