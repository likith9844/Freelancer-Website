/**
 * In-Memory Sliding Window Rate Limiter
 * Guards sensitive endpoints against credential brute-forcing, payment replay attacks, and denial of service.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

export function checkRateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = rateLimitMap.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(key, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const resetMs = oldestTimestamp + windowMs - now;
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetMs: Math.max(resetMs, 0),
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    limit,
    remaining: limit - record.timestamps.length,
    resetMs: windowMs,
  };
}

export function resetRateLimit(key: string) {
  rateLimitMap.delete(key);
}

// Preset Rate Limit Policies
export const RATE_LIMIT_POLICIES = {
  AUTH_LOGIN: { limit: 5, windowMs: 60000 },       // 5 attempts / min
  PAYMENT_VERIFY: { limit: 10, windowMs: 60000 },   // 10 verifications / min
  WITHDRAWAL_REQUEST: { limit: 3, windowMs: 60000 },// 3 payout requests / min
  STANDARD_API: { limit: 60, windowMs: 60000 },    // 60 requests / min
} as const;
