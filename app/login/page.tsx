'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoadingScreen } from '@/components/LoadingScreen'
import { REQUEST_TIMEOUT_MS } from '@/lib/constants'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pin, setPin] = useState(Array(8).fill(''))
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Validate returnUrl is a relative path (prevent open redirect)
  const returnUrl = searchParams.get('returnUrl')
  const isValidReturnUrl =
    returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')
  const safeReturnUrl = isValidReturnUrl ? returnUrl : '/'

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const resetPin = () => {
    setPin(Array(8).fill(''))
    inputRefs.current[0]?.focus()
  }

  const handleChange = (index: number, value: string) => {
    if (!/^[a-z]*$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value.slice(-1)
    setPin(newPin)
    setError('')

    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text').toLowerCase().slice(0, 8)
    if (!/^[a-z]*$/.test(pastedText)) return

    const newPin = Array(8).fill('')
    for (let i = 0; i < pastedText.length; i++) {
      newPin[i] = pastedText[i]
    }
    setPin(newPin)
    inputRefs.current[Math.min(pastedText.length, 7)]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pinCode = pin.join('')

    if (pinCode.length !== 8) {
      setError('Please enter all 8 characters')
      return
    }

    setIsLoading(true)
    setError('')

    // Add request timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinCode }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid PIN')
        resetPin()
        return
      }

      // Redirect to safe return URL
      router.push(safeReturnUrl)
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('Login error:', error)

      if (error instanceof Error && error.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else {
        setError('Something went wrong. Please try again.')
      }
      resetPin()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-md">
        <h1
          className="mb-8 text-center text-4xl font-bold"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
          }}
        >
          Bend 2026
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {pin.map((char, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el
                }}
                type="text"
                inputMode="text"
                maxLength={1}
                value={char}
                onChange={(e) => handleChange(index, e.target.value.toLowerCase())}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
                className="h-12 w-10 border text-center text-lg uppercase transition-all focus:outline-none disabled:opacity-50"
                aria-label={`PIN character ${index + 1}`}
              />
            ))}
          </div>

          {error && (
            <p
              role="alert"
              className="animate-shake text-center text-sm"
              style={{ color: 'var(--error)' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || pin.join('').length !== 8}
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--bg-card)',
              fontFamily: 'var(--font-body)',
            }}
            className="w-full px-4 py-3 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginContent />
    </Suspense>
  )
}
