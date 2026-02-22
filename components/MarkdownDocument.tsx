'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownDocumentProps {
  title: string
  content: string | null
}

export default function MarkdownDocument({ title, content }: MarkdownDocumentProps) {
  if (!content) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] py-12 px-4">
        <div className="max-w-[65ch] mx-auto">
          <h1 className="font-[family-name:var(--font-tenor)] text-3xl text-[var(--text-primary)] mb-8">
            {title}
          </h1>
          <p className="font-[family-name:var(--font-baskerville)] text-base text-[var(--text-muted)] leading-[1.7]">
            No content has been added yet. Check back soon!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12 px-4">
      <article className="max-w-[65ch] mx-auto">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="font-[family-name:var(--font-tenor)] text-3xl sm:text-4xl text-[var(--text-primary)] mb-8 mt-0">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-[family-name:var(--font-tenor)] text-xl sm:text-2xl text-[var(--text-primary)] mb-4 mt-10">
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
              <ul className="font-[family-name:var(--font-baskerville)] list-disc pl-6 mb-4 space-y-2 text-[var(--text-secondary)]">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="font-[family-name:var(--font-baskerville)] list-decimal pl-6 mb-4 space-y-2 text-[var(--text-secondary)]">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-[var(--text-secondary)] leading-[1.7]">
                {children}
              </li>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-[var(--text-primary)]">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-[var(--text-secondary)]">
                {children}
              </em>
            ),
            code: ({ className, children }) => {
              const isBlock = Boolean(className)
              if (isBlock) {
                return (
                  <code className="font-[family-name:var(--font-jetbrains)] text-sm block bg-[var(--bg-secondary)] text-[var(--accent-primary)] p-4 overflow-x-auto">
                    {children}
                  </code>
                )
              }
              return (
                <code className="font-[family-name:var(--font-jetbrains)] text-sm bg-[var(--bg-secondary)] text-[var(--accent-primary)] px-1.5 py-0.5 rounded-sm">
                  {children}
                </code>
              )
            },
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-[var(--accent-primary)] pl-4 italic text-[var(--text-muted)] my-4 mb-4">
                {children}
              </blockquote>
            ),
            hr: () => (
              <hr className="my-8 border-[var(--border)]" />
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-[var(--accent-primary)] underline hover:no-underline transition-opacity"
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full border-collapse text-[var(--text-primary)]">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-[var(--bg-secondary)]">{children}</thead>
            ),
            th: ({ children }) => (
              <th className="border border-[var(--border)] px-4 py-2 text-left font-[family-name:var(--font-tenor)]">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-[var(--border)] px-4 py-2 font-[family-name:var(--font-baskerville)] leading-[1.7]">
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  )
}
