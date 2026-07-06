import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = 3004;

// Create HTTP server manually
const httpServer = createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/notify') {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString());

        if (body.type === 'new_wish' && body.payload) {
          const { weddingId, ...wishData } = body.payload;

          if (weddingId) {
            io.to(`wedding:${weddingId}`).emit('new_wish', wishData);
            console.log(`[wish-broadcast] Broadcast wish to wedding:${weddingId}`);
          } else {
            io.emit('new_wish', wishData);
            console.log(`[wish-broadcast] Broadcast wish to all clients`);
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to parse body' }));
      }
    });
    req.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(500);
        res.end();
      }
    });
    return;
  }

  // Let socket.io handle everything else (WS upgrade, polling)
  res.writeHead(404);
  res.end('Not Found');
});

// Attach socket.io to the same HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`[wish-broadcast] Client connected: ${socket.id}`);

  socket.on('join_wedding', (weddingId: string) => {
    socket.join(`wedding:${weddingId}`);
    console.log(`[wish-broadcast] ${socket.id} joined wedding:${weddingId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[wish-broadcast] Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[wish-broadcast] WebSocket + HTTP server running on port ${PORT}`);
});