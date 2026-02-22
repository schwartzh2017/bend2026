import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Document = Database['public']['Tables']['documents']['Row']

export default async function RulesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('doc_type', 'game_rules')
    .single() as { data: Document | null; error: Error | null }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="max-w-[680px] mx-auto">
          <h1 className="font-[family-name:var(--font-tenor)] text-3xl text-[var(--text-primary)] mb-8">
            Game Rules
          </h1>
          <p className="text-[var(--text-muted)] font-[family-name:var(--font-baskerville)]">
            Unable to load game rules. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-4">
        <div className="max-w-[680px] mx-auto">
          <h1 className="font-[family-name:var(--font-tenor)] text-3xl text-[var(--text-primary)] mb-8">
            Game Rules
          </h1>
          <p className="text-[var(--text-muted)] font-[family-name:var(--font-baskerville)]">
            No game rules have been added yet. Check back soon!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4">
      <div className="max-w-[680px] mx-auto">
        <h1 className="font-[family-name:var(--font-tenor)] text-3xl text-[var(--text-primary)] mb-8">
          {document.title}
        </h1>
        <article>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 className="font-[family-name:var(--font-tenor)] text-xl text-[var(--text-primary)] mb-4 mt-8">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="font-[family-name:var(--font-tenor)] text-lg text-[var(--text-primary)] mb-3 mt-6">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="font-[family-name:var(--font-baskerville)] text-base text-[var(--text-secondary)] mb-4 leading-[1.7]">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="font-[family-name:var(--font-baskerville)] pl-6 mb-4 space-y-2 text-[var(--text-secondary)] list-disc">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="font-[family-name:var(--font-baskerville)] pl-6 mb-4 space-y-2 text-[var(--text-secondary)] list-decimal">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="font-[family-name:var(--font-baskerville)] text-[var(--text-secondary)] leading-[1.7]">
                  {children}
                </li>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-[var(--text-primary)]">
                  {children}
                </strong>
              ),
              code: ({ className, children }) => {
                const isInline = !className
                if (isInline) {
                  return (
                    <code className="font-[family-name:var(--font-jetbrains)] text-sm bg-[var(--bg-secondary)] text-[var(--accent-primary)] px-1 rounded-sm">
                      {children}
                    </code>
                  )
                }
                return (
                  <code className="font-[family-name:var(--font-jetbrains)] text-sm block bg-[var(--bg-secondary)] p-4 overflow-x-auto">
                    {children}
                  </code>
                )
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-[var(--accent-primary)] pl-4 italic text-[var(--text-muted)] my-4">
                  {children}
                </blockquote>
              ),
              hr: () => (
                <hr className="my-8 border-[var(--border)]" />
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-[var(--accent-primary)] underline hover:no-underline"
                >
                  {children}
                </a>
              ),
            }}
          >
            {document.content || ''}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
