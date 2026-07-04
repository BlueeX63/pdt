// Simple sliding window rate limiter for server-side protection
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function checkRateLimit(key: string, limit: number = 5, windowMs: number = 60000): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { count: 0, lastReset: now };

  if (now - record.lastReset > windowMs) {
    record.count = 0;
    record.lastReset = now;
  }

  if (record.count >= limit) {
    const timeUntilReset = Math.ceil((record.lastReset + windowMs - now) / 1000);
    return { success: false, remaining: 0, reset: timeUntilReset };
  }

  record.count += 1;
  rateLimitMap.set(key, record);
  return { success: true, remaining: limit - record.count, reset: 0 };
}
