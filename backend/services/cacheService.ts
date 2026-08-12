/**
 * In-memory cache service for AGMARKNET API responses.
 * TTL: 15 minutes. Reduces upstream API pressure and handles temporary outages.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const TTL_MS = 15 * 60 * 1000; // 15 minutes
const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Retrieve a value from cache if it exists and has not expired.
 * Returns null if the key is not found or expired.
 */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * Store a value in the cache with the default TTL.
 */
export function setCached<T>(key: string, data: T): void {
  const now = Date.now();
  cache.set(key, {
    data,
    timestamp: now,
    expiresAt: now + TTL_MS,
  });
}

/**
 * Retrieve stale cached data regardless of expiry.
 * Used as a fallback when AGMARKNET API is temporarily unavailable.
 * Returns null if the key was never cached.
 */
export function getStaleCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  return entry.data as T;
}

/**
 * Get the timestamp when the cache entry was last updated.
 * Returns null if not found.
 */
export function getCacheTimestamp(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;
  return new Date(entry.timestamp).toISOString();
}

/**
 * Invalidate a specific cache entry.
 */
export function invalidate(key: string): void {
  cache.delete(key);
}

/**
 * Clear all cached entries.
 */
export function clearAll(): void {
  cache.clear();
}
