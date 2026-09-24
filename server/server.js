import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { config } from './config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export async function startServer() {
  const app = createApp();

  // Attempt MongoDB connection if configured
  if (config.mongoUri) {
    try {
      await mongoose.connect(config.mongoUri);
      console.log('Successfully connected to MongoDB Cluster');
    } catch (mongoErr) {
      console.warn('MongoDB connection failed, operating with in-memory transactional datastore:', mongoErr.message);
    }
  } else {
    console.log('Operating with Cinevo In-Memory Transactional Datastore & Atomic Lock Engine');
  }

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: rootDir,
      server: {
        middlewareMode: true,
        port: config.port,
        host: '0.0.0.0',
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const express = (await import('express')).default;
    app.use(express.static(path.resolve(rootDir, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(rootDir, 'dist', 'index.html'));
    });
  }

  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`[CINEVO] Server running on http://0.0.0.0:${config.port}`);
  });

  return server;
}

// If executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}

export default startServer;
