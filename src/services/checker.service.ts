import type { CheckResult } from '../types/checker.js';
import { validateDestination } from '../utils/network.js';

const TIMEOUT = 8000;

export async function checkWebsite(
  input: string
): Promise<CheckResult> {

  const checkedAt = new Date().toISOString();

  const url = await validateDestination(input);

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, TIMEOUT);

  const start = performance.now();

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent': 'PingLite/0.2'
      }
    });

    const responseTime = Math.round(
      performance.now() - start
    );

    const redirect = response.status >= 300 &&
      response.status < 400;

    return {
      url: url.origin,
      online:
        response.status >= 200 &&
        response.status < 400,
      status: response.status,
      statusText: redirect
        ? 'Redirect (not followed)'
        : response.statusText,
      responseTime,
      protocol: url.protocol.replace(':', ''),
      checkedAt,
      ...(redirect
        ? { error: 'Redirect detected; destination not checked.' }
        : {})
    };

  } catch (error) {

    return {
      url: url.origin,
      online: false,
      status: null,
      statusText: 'Unavailable',
      responseTime: null,
      protocol: url.protocol.replace(':', ''),
      checkedAt,
      error: error instanceof Error &&
        error.name === 'AbortError'
          ? 'Request timed out.'
          : 'Website is unreachable.'
    };

  } finally {
    clearTimeout(timeout);
  }
}