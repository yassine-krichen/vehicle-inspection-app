/**
 * URL utilities for the application
 */

/**
 * Gets the base URL for the application
 * Uses NEXT_PUBLIC_APP_URL if available, otherwise falls back to window.location.origin
 * @returns The base URL (e.g., "https://example.com")
 */
export function getBaseUrl(): string {
  // Server-side: use environment variable
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }
  
  // Client-side: use environment variable or window.location
  return process.env.NEXT_PUBLIC_APP_URL || window.location.origin
}

/**
 * Constructs a public inspection report URL
 * @param shareToken The UUID share token
 * @returns Full URL to the public report
 */
export function getPublicReportUrl(shareToken: string): string {
  return `${getBaseUrl()}/view/${shareToken}`
}
