/**
 * Next.js Configuration
 * 
 * Security enhancements:
 * - React Strict Mode enabled (development warnings)
 * - Security headers configured via middleware
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow importing Python modules (for API routes)
  serverRuntimeConfig: {
    // Will be available only on the server side
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
  },
  // Security: Disable X-Powered-By header
  poweredByHeader: false,
}

module.exports = nextConfig
