import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Document } from '@/lib/supabase/types'
import MarkdownDocument from '@/components/MarkdownDocument'

export default async function RulesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('doc_type', 'game_rules')
    .maybeSingle() as { data: Document | null; error: { message: string } | null }

  if (error) {
    console.error('Failed to fetch game rules:', error.message)
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] py-12 px-4">
        <div className="max-w-[65ch] mx-auto">
          <h1 className="font-[family-name:var(--font-tenor)] text-3xl text-[var(--text-primary)] mb-8">
            Game Rules
          </h1>
          <p className="font-[family-name:var(--font-baskerville)] text-base text-[var(--text-muted)] leading-[1.7]">
            Unable to load game rules. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <MarkdownDocument
      title={document?.title ?? 'Game Rules'}
      content={document?.content ?? null}
    />
  )
}
