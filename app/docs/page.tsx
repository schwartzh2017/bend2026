import ReactMarkdown from 'react-markdown'

type Document = {
  id: string
  title: string
  doc_type: string
  content: string | null
  storage_path: string | null
}

async function getDocument(): Promise<Document | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/documents`, {
    cache: 'no-store'
  })

  if (!res.ok) return null

  const data = await res.json()
  return data.data
}

export default async function DocsPage() {
  const doc = await getDocument()

  if (!doc || !doc.content) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-muted)' }}>No documents available yet.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <article
        className="max-w-[65ch] mx-auto"
        style={{ color: 'var(--text-primary)' }}
      >
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="font-[family-name:var(--font-tenor)] text-3xl sm:text-4xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-[family-name:var(--font-tenor)] text-xl sm:text-2xl font-bold mt-8 mb-4" style={{ color: 'var(--text-primary)' }}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-[family-name:var(--font-tenor)] text-lg font-bold mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-1 pl-2" style={{ color: 'var(--text-primary)' }}>
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 space-y-1 pl-2" style={{ color: 'var(--text-primary)' }}>
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {children}
              </strong>
            ),
            code: ({ children }) => (
              <code
                className="font-[family-name:var(--font-jetbrains)] px-1.5 py-0.5 rounded text-sm"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--accent-primary)' }}
              >
                {children}
              </code>
            ),
            blockquote: ({ children }) => (
              <blockquote
                className="border-l-4 pl-4 italic my-4"
                style={{ borderColor: 'var(--accent-primary)', color: 'var(--text-secondary)' }}
              >
                {children}
              </blockquote>
            ),
            hr: () => (
              <hr className="my-8" style={{ borderColor: 'var(--border)' }} />
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="underline hover:opacity-80 transition-opacity"
                style={{ color: 'var(--accent-primary)' }}
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full border-collapse" style={{ color: 'var(--text-primary)' }}>
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>{children}</thead>
            ),
            th: ({ children }) => (
              <th className="border px-4 py-2 text-left font-bold font-[family-name:var(--font-tenor)]" style={{ borderColor: 'var(--border)' }}>
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border px-4 py-2" style={{ borderColor: 'var(--border)' }}>
                {children}
              </td>
            ),
          }}
        >
          {doc.content}
        </ReactMarkdown>
      </article>
    </div>
  )
}
