/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

interface MapState {
  name: string;
  imageUrl: string;
  banned: boolean;
  picked: boolean;
  bannedBy?: 0 | 1;
  side?: 0 | 1;
  selectedBy?: 0 | 1;
  order?: number;
}

interface Session {
  id: string;
  leftTeam: string;
  rightTeam: string;
  bestOf: number;
  mapStates: MapState[];
  vetoOrder: vetoOrder[];
}
interface vetoOrder {
  order: number;
  type: string;
  map: number;
  side?: number;
}

interface ValorantMap {
  displayName: string;
  splash: string;
}

interface ValorantApiResponse {
  status: number;
  data: ValorantMap[];
}

async function getMapSplashByName(mapName: string): Promise<string | null> {
  try {
    const response = await fetch('https://valorant-api.com/v1/maps');
    const data: ValorantApiResponse = await response.json();
    
    if (data.status !== 200) {
      throw new Error('Failed to fetch map data');
    }

    const map = data.data.find(
      (map) => map.displayName.toLowerCase() === mapName.toLowerCase()
    );

    return map ? map.splash : null;
  } catch (error) {
    console.error('Error fetching map splash:', error);
    return null;
  }
}

async function initializeMapStates(mapList: string[]): Promise<MapState[]> {
  // Create initial states with URLs
  const mapStatesPromises = mapList.map(async (mapName): Promise<MapState> => {
    const imageUrl = await getMapSplashByName(mapName) || '';
    return {
      name: mapName,
      imageUrl,
      banned: false,
      picked: false,
    };
  });

  // Wait for all image URLs to be fetched
  const mapStates = await Promise.all(mapStatesPromises);

  return mapStates;
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const sessions = new Map<string, Session>();
// Socket event handlers
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('createSession', async ({ leftTeam, rightTeam, bestOf, mapList , vetoOrder}) => {
    const session: Session = {
      id: uuidv4(),
      leftTeam,
      rightTeam,
      bestOf,
      mapStates: [],
      vetoOrder,
    };
    sessions.set(session.id, session);
    session.mapStates = await initializeMapStates(mapList);
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

  socket.on('updateMapStates', ({ sessionId, mapStates }) => {
    const session = sessions.get(sessionId);
    if (session) {
      session.mapStates = mapStates;
      sessions.set(sessionId, session);
      io.emit('mapStatesUpdated', session);
      console.log('Map states updated:', mapStates);
    }
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env['PORT'] || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
