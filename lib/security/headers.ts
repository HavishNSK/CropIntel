/**
 * Security Headers Middleware
 * 
 * Implements security headers following OWASP best practices.
 * Provides defense-in-depth security controls.
 * 
 * Security Headers:
 * - Content-Security-Policy (CSP): Prevents XSS attacks
 * - X-Frame-Options: Prevents clickjacking
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - Referrer-Policy: Controls referrer information leakage
 * - Permissions-Policy: Restricts browser features
 * - Strict-Transport-Security: Enforces HTTPS (production only)
 * 
 * OWASP Compliance:
 * - Addresses A05:2021 (Security Misconfiguration)
 * - Implements "Defense in Depth" principle
 */

import { NextResponse } from 'next/server'

/**
 * CSP: intentionally no `upgrade-insecure-requests`.
 * That directive breaks http://localhost when NODE_ENV=production (`next start` after build):
 * the browser rewrites /_next/static/... to https://localhost/... which has no TLS, so CSS/JS fail and the app is unstyled.
 * Real HTTPS deployments still get HSTS below when NODE_ENV=production.
 */
function contentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://maps.googleapis.com https://*.googleapis.com",
    "connect-src 'self' https://maps.googleapis.com",
    "font-src 'self' data:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')
}

/**
 * Security headers configuration
 *
 * Note: CSP policy may need adjustment based on your specific needs
 * (e.g., if you use external CDNs, analytics, etc.)
 */
const SECURITY_HEADERS = {
  'Content-Security-Policy': contentSecurityPolicy(),

  /**
   * X-Frame-Options
   * Prevents clickjacking attacks by preventing page embedding
   */
  'X-Frame-Options': 'DENY',

  /**
   * X-Content-Type-Options
   * Prevents MIME type sniffing attacks
   */
  'X-Content-Type-Options': 'nosniff',

  /**
   * Referrer-Policy
   * Controls referrer information to prevent data leakage
   * 'strict-origin-when-cross-origin' sends full URL for same-origin, origin only for cross-origin
   */
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  /**
   * Permissions-Policy (formerly Feature-Policy)
   * Restricts browser features to prevent abuse
   * 
   * Disabled features:
   * - camera, microphone: Prevent unauthorized access
   * - geolocation: Only allow when explicitly requested
   * - payment: Disable payment APIs
   * - usb: Disable USB access
   */
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'payment=()',
    'usb=()',
  ].join(', '),

  /**
   * Strict-Transport-Security (HSTS)
   * Enforces HTTPS connections (production only)
   * 
   * Note: Only set in production to avoid issues in development
   */
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }),
}

/**
 * Add security headers to response
 * 
 * @param response - Next.js response object
 * @returns Response with security headers added
 * 
 * Usage:
 * ```typescript
 * const response = NextResponse.json(data)
 * return addSecurityHeaders(response)
 * ```
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Add all security headers to response
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

/**
 * Create a secure response with security headers
 * 
 * @param body - Response body (JSON object)
 * @param status - HTTP status code (default: 200)
 * @returns Secure NextResponse with headers
 */
export function createSecureResponse(
  body: any,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(body, { status })
  return addSecurityHeaders(response)
}
