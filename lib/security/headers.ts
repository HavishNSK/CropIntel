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
 * Security headers configuration
 * 
 * Note: CSP policy may need adjustment based on your specific needs
 * (e.g., if you use external CDNs, analytics, etc.)
 */
const SECURITY_HEADERS = {
  /**
   * Content-Security-Policy
   * Prevents XSS attacks by controlling resource loading
   * 
   * Policy breakdown:
   * - default-src 'self': Only allow resources from same origin
   * - script-src 'self' 'unsafe-inline' 'unsafe-eval': Allow scripts (adjust for production)
   * - style-src 'self' 'unsafe-inline': Allow inline styles (needed for Tailwind)
   * - img-src 'self' data: blob:: Allow images from same origin, data URIs, and blob URIs
   * - connect-src 'self' https://maps.googleapis.com https://agrio-api-gateway-6it0wqn1.uc.gateway.dev: Allow API connections
   * - font-src 'self' data:: Allow fonts from same origin and data URIs
   * - frame-src 'none': Disallow iframes (prevents clickjacking)
   * - object-src 'none': Disallow plugins
   * - base-uri 'self': Restrict base tag URLs
   * - form-action 'self': Restrict form submissions
   * - frame-ancestors 'none': Prevent embedding in iframes
   * - upgrade-insecure-requests: Upgrade HTTP to HTTPS
   */
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://maps.googleapis.com https://*.googleapis.com",
    "connect-src 'self' https://maps.googleapis.com https://agrio-api-gateway-6it0wqn1.uc.gateway.dev",
    "font-src 'self' data:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; '),

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
