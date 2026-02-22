'use client'

import { useState, useEffect, useCallback } from 'react'
import GroceryItem from '@/components/GroceryItem'
import GroceryCategoryHeader, { getCategoryOrder } from '@/components/GroceryCategoryHeader'
import AddGroceryForm from '@/components/AddGroceryForm'
import { LoadingScreen } from '@/components/LoadingScreen'
import type { GroceryItem as GroceryItemType, Person } from '@/lib/supabase/types'

type GroceryItemWithPerson = GroceryItemType & {
  requested_by: Person | null
}

export default function GroceryPage() {
  const [items, setItems] = useState<GroceryItemWithPerson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch('/api/grocery-items')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setItems(data.data || [])
    } catch (err) {
      setError('Failed to load grocery list')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleToggle = async (id: string, is_checked: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_checked } : item
      )
    )

    try {
      await fetch('/api/grocery-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_checked }),
      })
    } catch (err) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_checked: !is_checked } : item
        )
      )
    }
  }

  const handleItemAdded = () => {
    fetchItems()
  }

  if (isLoading) return <LoadingScreen />

  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, GroceryItemWithPerson[]>)

  const sortedCategories = Object.keys(groupedItems).sort(
    (a, b) => getCategoryOrder(a) - getCategoryOrder(b)
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-[680px] mx-auto p-4">
        <h1
          className="font-[family-name:var(--font-tenor)] font-bold text-3xl mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          Grocery List
        </h1>

        {error ? (
          <div className="text-center py-12">
            <p style={{ color: 'var(--error)' }}>{error}</p>
            <button
              onClick={fetchItems}
              className="mt-4 px-4 py-2 rounded-sm border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <AddGroceryForm onItemAdded={handleItemAdded} />
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ color: 'var(--text-muted)' }}>
                  No items yet. Add something to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {sortedCategories.map((category) => (
                  <div key={category}>
                    <GroceryCategoryHeader
                      category={category}
                      count={groupedItems[category].length}
                    />
                    <div className="space-y-0.5">
                      {groupedItems[category]
                        .sort((a, b) => {
                          if (a.is_checked !== b.is_checked) {
                            return a.is_checked ? 1 : -1
                          }
                          return 0
                        })
                        .map((item) => (
                          <GroceryItem
                            key={item.id}
                            item={item}
                            onToggle={handleToggle}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
