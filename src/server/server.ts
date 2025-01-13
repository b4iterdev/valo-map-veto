require("dotenv").config();
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

interface Session {
  id: string;
  leftTeam: string;
  rightTeam: string;
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

const sessions = new Map<string, Session>();

// Socket event handlers
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('createSession', ({ leftTeam, rightTeam }) => {
    const session: Session = {
      id: uuidv4(),
      leftTeam,
      rightTeam
    };
    sessions.set(session.id, session);
    console.log('Session created:', session);
    socket.emit('sessionCreated', session);
  });

  socket.on('getSession', (sessionId: string) => {
    const session = sessions.get(sessionId);
    if (session) {
      socket.emit('sessionData', session);
    } else {
      socket.emit('sessionError', { message: 'Session not found' });
    }
  });
});

const PORT = process.env['PORT'] || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});