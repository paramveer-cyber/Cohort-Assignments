import 'dotenv/config';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { WebSocketServer } from 'ws';
import { router as authRouter, sessionMiddleware } from './routes/auth.js';
import { initWebSocket } from './lib/websocket.js';
import { getState } from './lib/checkboxes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocketServer({ server });

app.set('trust proxy', 1);
app.use(express.json());
app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, '../public')));

app.use('/auth', authRouter);

app.get('/api/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json(req.user);
});

app.get('/api/state', async (req, res) => {
  try {
    const buf = await getState();
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(buf);
  } catch (err) {
    console.error('[api] state error', err);
    res.status(500).json({ error: 'Failed' });
  }
});

initWebSocket(wss);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
