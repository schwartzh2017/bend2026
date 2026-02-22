type Props = {
  category: string
}

const categoryColors: Record<string, string> = {
  lodging: 'var(--accent-warm)',
  food: 'var(--accent-primary)',
  alcohol: 'var(--accent-gold)',
  transport: 'var(--accent-secondary)',
  activities: 'var(--accent-primary)',
  general: 'var(--text-muted)',
}

const categoryLabels: Record<string, string> = {
  lodging: 'Lodging',
  food: 'Food & Dining',
  alcohol: 'Alcohol',
  transport: 'Transportation',
  activities: 'Activities',
  general: 'General',
}

export default function CategoryHeader({ category }: Props) {
  const color = categoryColors[category] || categoryColors.general
  const label = categoryLabels[category] || category

  return (
    <div
      className="flex items-center gap-3 mb-4 mt-8 first:mt-0"
    >
      <div
        className="w-1 h-6 rounded-full"
        style={{ backgroundColor: color }}
      />
      <h3
        className="font-[family-name:var(--font-playfair)] font-bold text-sm uppercase tracking-[0.08em]"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </h3>
    </div>
  )
}
