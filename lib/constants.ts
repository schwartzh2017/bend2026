// Shared constants for the Bend Trip App

// Session & Authentication
export const SESSION_COOKIE_NAME = 'bend-session' as const
export const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60 // 30 days
export const JWT_MIN_SECRET_LENGTH = 32

// localStorage keys
export const LOCAL_STORAGE_KEYS = {
  PERSON_ID: 'bend_person_id',
  PERSON_NAME: 'bend_person_name',
} as const

// Routes
export const PUBLIC_ROUTES = ['/login', '/identify'] as const
export const PUBLIC_ROUTE_PREFIXES = ['/api/auth'] as const

// Network
export const REQUEST_TIMEOUT_MS = 10000 // 10 seconds
