import { SignJWT, jwtVerify } from 'jose'
import { JWT_MIN_SECRET_LENGTH } from './constants'

/**
 * Get and validate JWT secret from environment
 * @throws Error if JWT_SECRET is missing or too short
 */
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is not set. Please add it to your .env.local file.'
    )
  }

  if (secret.length < JWT_MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${JWT_MIN_SECRET_LENGTH} characters long for security. Current length: ${secret.length}`
    )
  }

  return new TextEncoder().encode(secret)
}

/**
 * Create a signed JWT session token
 * @param personId Optional person ID to store in the token
 */
export async function signSession(personId?: string): Promise<string> {
  const secret = getJWTSecret()
  const token = await new SignJWT({
    authenticated: true,
    personId: personId || null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)
  return token
}

/**
 * Verify a JWT session token
 * @returns true if valid, false otherwise
 */
export async function verifySession(token: string): Promise<boolean> {
  try {
    const secret = getJWTSecret()
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

/**
 * Verify and decode a JWT session token
 * @returns payload if valid, null otherwise
 */
export async function getSessionData(
  token: string
): Promise<{ authenticated: boolean; personId: string | null } | null> {
  try {
    const secret = getJWTSecret()
    const { payload } = await jwtVerify(token, secret)
    return payload as { authenticated: boolean; personId: string | null }
  } catch {
    return null
  }
}
