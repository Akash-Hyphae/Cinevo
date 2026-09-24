import { startServer } from './server/server.js';

startServer().catch((err) => {
  console.error('Failed to start Cinevo server:', err);
  process.exit(1);
});
