import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { SESSION_COOKIE_NAME, JWT_MIN_SECRET_LENGTH } from '@/lib/constants'

function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < JWT_MIN_SECRET_LENGTH) {
    return new Uint8Array()
  }
  return new TextEncoder().encode(secret)
}

async function verifySession(token: string): Promise<boolean> {
  try {
    const secret = getJWTSecret()
    if (secret.length === 0) return false
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

const PUBLIC_ROUTES = ['/login', '/identify']
const PUBLIC_ROUTE_PREFIXES = ['/api/auth']

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true
  if (PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true
  return false
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const isAuthenticated = sessionToken ? await verifySession(sessionToken) : false

  if (isAuthenticated) {
    if (isPublicRoute(pathname)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('returnUrl', pathname)
  return NextResponse.redirect(loginUrl)
}
