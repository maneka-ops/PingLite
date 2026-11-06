
import type { MiddlewareHandler } from 'hono';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const requests = new Map<string, RateLimitEntry>();

const WINDOW = 60_000;
const MAX_REQUESTS = 20;

export const rateLimit: MiddlewareHandler = async (
  c,
  next
) => {

  const forwarded = c.req.header('x-forwarded-for');

  // reverse proxy.
  const ip = c.env?.TRUSTED_PROXY === 'true' && forwarded
    ? forwarded.split(',')[0].trim()
    : 'unknown';

  const now = Date.now();

  const entry = requests.get(ip);

  if (!entry || entry.resetAt <= now) {

    requests.set(ip, {
      count: 1,
      resetAt: now + WINDOW
    });

  } else {

    if (entry.count >= MAX_REQUESTS) {
      return c.json({
        success: false,
        error: 'Too many requests. Please try again later.'
      }, 429);
    }

    entry.count++;
  }

  await next();
};