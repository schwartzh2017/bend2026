type Props = {
  category: string
  count: number
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  produce: { label: 'Produce', color: 'var(--accent-primary)' },
  protein: { label: 'Protein', color: 'var(--accent-warm)' },
  dairy: { label: 'Dairy', color: 'var(--accent-secondary)' },
  drinks: { label: 'Drinks', color: 'var(--accent-gold)' },
  snacks: { label: 'Snacks', color: 'var(--text-muted)' },
  alcohol: { label: 'Alcohol', color: 'var(--accent-gold)' },
  other: { label: 'Other', color: 'var(--text-muted)' },
}

const CATEGORY_ORDER = ['produce', 'protein', 'dairy', 'drinks', 'snacks', 'alcohol', 'other']

export function getCategoryOrder(category: string): number {
  const index = CATEGORY_ORDER.indexOf(category)
  return index === -1 ? CATEGORY_ORDER.length : index
}

export default function GroceryCategoryHeader({ category, count }: Props) {
  const config = categoryConfig[category] || categoryConfig.other

  return (
    <div className="flex items-center gap-3 mb-3 mt-6 first:mt-0">
      <div
        className="w-1.5 h-6 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      <h3
        className="font-[family-name:var(--font-tenor)] font-bold text-sm uppercase tracking-[0.1em]"
        style={{ color: 'var(--text-secondary)' }}
      >
        {config.label}
      </h3>
      <span
        className="text-xs font-mono"
        style={{ color: 'var(--text-muted)' }}
      >
        {count}
      </span>
    </div>
  )
}
