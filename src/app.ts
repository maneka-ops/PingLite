import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';

import health from './routes/health.js';
import checker from './routes/checker.js';

const app = new Hono();

app.route('/api/health', health);

app.route('/api/v1/check', checker);

app.use('/assets/*', serveStatic({
  root: './public'
}));

app.get('/', serveStatic({
  root: './public',
  path: 'index.html'
}));

app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Route not found.'
  }, 404);
});

app.onError((error, c) => {
  console.error('PingLite error:', error);

  return c.json({
    success: false,
    error: 'Internal server error.'
  }, 500);
});

export default app;