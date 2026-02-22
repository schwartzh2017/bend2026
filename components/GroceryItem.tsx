'use client'

import type { GroceryItem as GroceryItemType, Person } from '@/lib/supabase/types'

type Props = {
  item: GroceryItemType & { requested_by: Person | null }
  onToggle: (id: string, is_checked: boolean) => void
}

export default function GroceryItem({ item, onToggle }: Props) {
  return (
    <div
      className={`flex items-start gap-3 py-2.5 px-3 rounded-sm transition-colors ${
        item.is_checked ? 'grocery-item-checked' : ''
      }`}
      style={{ backgroundColor: item.is_checked ? 'var(--bg-secondary)' : 'transparent' }}
    >
      <input
        type="checkbox"
        checked={item.is_checked}
        onChange={() => onToggle(item.id, !item.is_checked)}
        className="grocery-checkbox mt-0.5"
        aria-label={`Mark ${item.name} as ${item.is_checked ? 'unchecked' : 'checked'}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="grocery-item-text font-[family-name:var(--font-baskerville)]">
            {item.name}
          </span>
          {item.quantity && (
            <span
              className="text-sm font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              {item.quantity}
            </span>
          )}
        </div>
        {item.requested_by && (
          <p
            className="text-xs mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Requested by {item.requested_by.name}
          </p>
        )}
      </div>
    </div>
  )
}
