'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/types'
import { LoadingScreen } from '@/components/LoadingScreen'
import { LOCAL_STORAGE_KEYS } from '@/lib/constants'

type Person = Tables<'people'>

function IdentifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Validate returnUrl is a relative path (prevent open redirect)
  const returnUrl = searchParams.get('returnUrl')
  const isValidReturnUrl =
    returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')
  const safeReturnUrl = isValidReturnUrl ? returnUrl : '/'

  useEffect(() => {
    const fetchPeople = async () => {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('people')
        .select('*')
        .order('name')

      if (fetchError) {
        console.error('Failed to fetch people:', fetchError)
        setError('Failed to load people')
        setIsLoading(false)
        return
      }

      setPeople(data)
      setIsLoading(false)
    }

    fetchPeople()
  }, [])

  const handleSelect = (person: Person) => {
    // Store person info in localStorage
    // TODO: Consider moving this to JWT payload for better security
    localStorage.setItem(LOCAL_STORAGE_KEYS.PERSON_ID, person.id)
    localStorage.setItem(LOCAL_STORAGE_KEYS.PERSON_NAME, person.name)
    router.push(safeReturnUrl)
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <p role="alert" style={{ color: 'var(--error)' }}>
          {error}
        </p>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-8"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <h1
        className="mb-8 text-center text-4xl font-bold"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--text-primary)',
        }}
      >
        Who are you?
      </h1>

      <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {people.map((person) => (
          <button
            key={person.id}
            onClick={() => handleSelect(person)}
            style={{
              backgroundColor: 'var(--bg-card)',
              borderLeftColor: person.color,
              borderLeftWidth: '4px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              boxShadow: '2px 3px 12px var(--shadow)',
            }}
            className="p-4 text-left transition-all hover:-translate-y-0.5"
          >
            <span>{person.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function IdentifyPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <IdentifyContent />
    </Suspense>
  )
}
