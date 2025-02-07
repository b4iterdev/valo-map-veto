/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

interface MapState {
  name: string;
  imageUrl: string;
  banned: boolean;
  picked: boolean;
  bannedBy?: number;
  side?: number;
  selectedBy?: number;
  order?: number;
}

interface Session {
  id: string;
  leftTeam: string;
  rightTeam: string;
  bestOf: number;
  mapStates: MapState[];
  vetoOrder: vetoOrder[];
  finished: boolean;
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

const sessionsDir = path.join(__dirname, '../../sessions');
const resultDir = path.join(__dirname, '../../result');

if (!fs.existsSync(resultDir)) {
  fs.mkdirSync(resultDir, { recursive: true });
}

if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

async function getMapSplashByName(mapName: string): Promise<string | null> {
  try {
    const response = await fetch('https://valorant-api.com/v1/maps');
    const data: ValorantApiResponse = await response.json();

    if (data.status !== 200) {
      throw new Error('Failed to fetch map data');
    }

    const map = data.data.find(
      (map) => map.displayName.toLowerCase() === mapName.toLowerCase(),
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
    const imageUrl = (await getMapSplashByName(mapName)) || '';
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

function saveSession(session: Session) {
  const filePath = path.join(sessionsDir, `${session.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
}

function getSession(sessionId: string): Session | null {
  const filePath = path.join(sessionsDir, `${sessionId}.json`);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return null;
}

function deleteSession(sessionId: string) {
  const filePath = path.join(sessionsDir, `${sessionId}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

// Socket event handlers
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on(
    'createSession',
    async ({ leftTeam, rightTeam, bestOf, mapList, vetoOrder }) => {
      const session: Session = {
        id: uuidv4(),
        leftTeam,
        rightTeam,
        bestOf,
        mapStates: [],
        vetoOrder,
        finished: false,
      };
      session.mapStates = await initializeMapStates(mapList);
      saveSession(session);
      console.log('Session created:', session);
      socket.emit('sessionCreated', session);
    },
  );

  socket.on('getSession', (sessionId: string) => {
    const session = getSession(sessionId);
    if (session) {
      socket.emit('sessionData', session);
    } else {
      socket.emit('sessionError', { message: 'Session not found' });
    }
  });

  socket.on('updateMapStates', ({ sessionId, mapStates }) => {
    const session = getSession(sessionId);
    if (session) {
      session.mapStates = mapStates;
      saveSession(session);
      io.emit('mapStatesUpdated', session);
      console.log('Map states updated:', mapStates);
    }
  });
  socket.on('finishSession', (sessionId: string) => {
    const session = getSession(sessionId);
    if (session) {
      session.finished = true;
      // Move to result directory instead of sessions
      const resultPath = path.join(resultDir, `${session.id}.json`);
      fs.writeFileSync(resultPath, JSON.stringify(session, null, 2));
      deleteSession(sessionId); // Remove from sessions directory
      console.log('Session finished:', sessionId);
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
