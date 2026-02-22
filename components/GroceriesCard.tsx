import HomeCard from './HomeCard'
import type { Tables, Person } from '@/lib/supabase/types'

type GroceryItem = Tables<'grocery_items'> & {
  requested_by: Person | null
}

type Props = {
  items: GroceryItem[]
}

export default function GroceriesCard({ items }: Props) {
  if (items.length === 0) {
    return (
      <HomeCard title="Groceries" href="/grocery">
        <p style={{ color: 'var(--text-muted)' }}>Grocery list is empty</p>
      </HomeCard>
    )
  }

  return (
    <HomeCard title="Groceries" href="/grocery">
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2"
          >
            <span
              className="font-[family-name:var(--font-baskerville)]"
              style={{ color: 'var(--text-primary)' }}
            >
              {item.name}
            </span>
            {item.requested_by && (
              <span
                className="text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                ({item.requested_by.name})
              </span>
            )}
          </div>
        ))}
      </div>
    </HomeCard>
  )
}
