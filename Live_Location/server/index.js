import 'dotenv/config';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { Server } from 'socket.io';
import { router as authRouter, sessionMiddleware } from './routes/auth.js';
import { initProducer, createConsumer, TOPIC } from './lib/kafka.js';
import { initSockets } from './lib/sockets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app    = express();
const server = http.createServer(app);
const io     = new Server(server);

app.set('trust proxy', 1);
app.use(express.json());
app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, '../public')));

app.use('/auth', authRouter);

app.get('/api/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json(req.user);
});

async function start() {
  // Kafka producer (used by socket server to publish location events)
  await initProducer();

  // Kafka consumer group for socket broadcasting
  const socketConsumer = createConsumer('livetrack-socket-broadcaster');
  await socketConsumer.connect();
  await socketConsumer.subscribe({ topic: TOPIC, fromBeginning: false });

  initSockets(io, socketConsumer);

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[server] fatal startup error', err);
  process.exit(1);
});
