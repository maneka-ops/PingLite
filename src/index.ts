import { serve } from '@hono/node-server';
import app from './app.js';

const port = Number(process.env.PORT) || 4000;

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log('');
  console.log('---------------------------');
  console.log('       Ubetatta');
  console.log('---------------------------');
  console.log(`Server: http://localhost:${info.port}`);
  console.log('Status: Running');
  console.log('---------------------------');
  console.log('');
});