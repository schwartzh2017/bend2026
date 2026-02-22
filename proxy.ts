import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from '@/lib/auth'
import { SESSION_COOKIE_NAME, PUBLIC_ROUTES, PUBLIC_ROUTE_PREFIXES } from '@/lib/constants'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes through without authentication
  if (PUBLIC_ROUTES.includes(pathname as any)) {
    return NextResponse.next()
  }

  // Allow public route prefixes (like /api/auth)
  if (PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  // Check for valid session
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (sessionToken && (await verifySession(sessionToken))) {
    return NextResponse.next()
  }

  // Redirect to login with return URL
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('returnUrl', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
