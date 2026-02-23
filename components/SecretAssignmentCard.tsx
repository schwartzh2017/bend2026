'use client'

import { useState } from 'react'

type Props = {
  assignedPersonName: string
  assignedWord: string
}

export default function SecretAssignmentCard({
  assignedPersonName,
  assignedWord,
}: Props) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div
      className="border p-5"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
        boxShadow: '2px 3px 12px var(--shadow)',
      }}
    >
      <div className="flex items-start justify-between">
        <h2
          className="font-[family-name:var(--font-tenor)] text-xs uppercase tracking-[0.06em]"
          style={{ color: 'var(--text-muted)' }}
        >
          Your Secret Assignment
        </h2>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="ml-2 p-1 transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-primary)' }}
          aria-label={isVisible ? 'Hide assignment' : 'Show assignment'}
        >
          {isVisible ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      <div
        className="mt-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {isVisible ? (
          <p>
            Your secret assignment this weekend is to get{' '}
            <span className="font-semibold">{assignedPersonName}</span> to say{' '}
            <span className="font-semibold">{assignedWord}</span>. Do not share this
            assignment with anyone.
          </p>
        ) : (
          <p className="italic opacity-60">Click the eye to reveal your assignment</p>
        )}
      </div>
    </div>
  )
}
