import { Hono } from 'hono';
import { checkerSchema } from '../schemas/checker.schema.js';
import { checkWebsite } from '../services/checker.service.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { failure, success } from '../utils/response.js';

const checker = new Hono();

checker.use('*', rateLimit);

checker.get('/', async (c) => {

  const input = checkerSchema.safeParse({
    url: c.req.query('url')
  });

  if (!input.success) {
    return failure(
      c,
      input.error.issues[0]?.message || 'Invalid URL.'
    );
  }

  try {

    const result = await checkWebsite(input.data.url);

    return success(c, result);

  } catch (error) {

    const message = error instanceof Error
      ? error.message
      : 'Unable to check website.';

    return failure(c, message);
  }
});

export default checker;