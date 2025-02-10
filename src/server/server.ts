/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
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
  logo: string;
  leftTeam: string;
  leftLogo: string;
  rightTeam: string;
  rightLogo: string;
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
app.use(cors());
app.use(express.json());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

// Socket event handlers
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on(
    'createSession',
    async ({ logo, leftTeam, leftLogo, rightTeam, rightLogo, bestOf, mapList, vetoOrder }) => {
      const session: Session = {
        id: uuidv4(),
        logo,
        leftTeam,
        leftLogo,
        rightTeam,
        rightLogo,
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

// Add HTTP endpoint for match creation
app.get('/create', async (req, res) => {
  try {
    const { leftTeam, rightTeam, bestOf, leftLogo, rightLogo } = req.query;

    // Validate input parameters
    if (!leftTeam || !rightTeam || !bestOf) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters',
      });
    }

    const Bo = parseInt(bestOf as string);
    if (![1, 3, 5].includes(Bo)) {
      return res.status(400).json({
        status: 'error',
        message: 'Best of must be 1, 3, or 5',
      });
    }

    // Define default maps and veto order based on Bo
    const mapList = [
      'Fracture',
      'Bind',
      'Haven',
      'Pearl',
      'Split',
      'Abyss',
      'Lotus',
    ];
    let vetoOrder: vetoOrder[];

    switch (Bo) {
      case 3:
        vetoOrder = [
          { order: 1, type: 'ban', map: 0 },
          { order: 2, type: 'ban', map: 1 },
          { order: 3, type: 'pick', map: 0, side: 1 },
          { order: 4, type: 'pick', map: 1, side: 0 },
          { order: 5, type: 'ban', map: 0 },
          { order: 6, type: 'decider', map: 1, side: 0 },
        ];
        break;
      case 1:
        vetoOrder = [
          { order: 1, type: 'ban', map: 0 },
          { order: 2, type: 'ban', map: 1 },
          { order: 3, type: 'ban', map: 0 },
          { order: 4, type: 'ban', map: 1 },
          { order: 5, type: 'ban', map: 0 },
          { order: 6, type: 'decider', map: 1, side: 0 },
        ];
        break;
      case 5:
        vetoOrder = [
          { order: 1, type: 'pick', map: 0, side: 1 },
          { order: 2, type: 'pick', map: 1, side: 0 },
          { order: 3, type: 'pick', map: 0, side: 1 },
          { order: 4, type: 'pick', map: 1, side: 0 },
          { order: 5, type: 'ban', map: 0 },
          { order: 6, type: 'decider', map: 1, side: 0 },
        ];
        break;
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Unsupported Bo format',
        });
    }

    // Create new session
    const sessionId = uuidv4();
    const session: Session = {
      id: sessionId,
      logo: 'assets/mics/V_Lockup_Horizontal_Pos_Off-White.png',
      leftTeam: leftTeam as string,
      leftLogo: leftLogo as string,
      rightTeam: rightTeam as string,
      rightLogo: rightLogo as string,
      bestOf: Bo,
      mapStates: [],
      vetoOrder,
      finished: false,
    };
    session.mapStates = await initializeMapStates(mapList);
    saveSession(session);
    console.log('Session created:', session);

    // Return success response
    res.json({
      status: 'success',
      data: {
        sessionId,
      },
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

app.get('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;

    // Validate session ID
    if (!sessionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Session ID is required',
      });
    }

    // Check if session exists
    const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
    if (!fs.existsSync(sessionPath)) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found',
      });
    }

    // Read and parse session data
    const sessionData = fs.readFileSync(sessionPath, 'utf8');
    const session: Session = JSON.parse(sessionData);

    // Return session data
    res.json({
      status: 'success',
      data: session,
    });
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

app.get('/result/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;

    // Validate session ID
    if (!sessionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Session ID is required',
      });
    }

    // Check if session exists
    const sessionPath = path.join(resultDir, `${sessionId}.json`);
    if (!fs.existsSync(sessionPath)) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found',
      });
    }

    // Read and parse session data
    const sessionData = fs.readFileSync(sessionPath, 'utf8');
    const session: Session = JSON.parse(sessionData);

    // Return session data
    res.json({
      status: 'success',
      data: session,
    });
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

const PORT = process.env['PORT'] || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
