import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SocketService } from './socket.service';

export interface MapState {
  name: string;
  imageUrl: string;
  banned: boolean;
  picked: boolean;
  bannedBy?: number;
  side?: number;
  selectedBy?: number;
  order?: number;
}

export interface Session {
  id: string;
  logo: string;
  leftTeam: string;
  leftLogo: string;
  rightTeam: string;
  rightLogo: string;
  bestOf: number;
  mapList: string[];
  mapStates: MapState[];
  vetoOrder?: vetoOrder[];
  finished: boolean;
}

export interface vetoOrder {
  order: number;
  type: string;
  map: number;
  side?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private currentSession = new BehaviorSubject<Session | null>(null);
  currentSession$ = this.currentSession.asObservable();

  constructor(private socketService: SocketService) {
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    const socket = this.socketService.getSocket();

    socket.on('sessionCreated', (session: Session) => {
      this.currentSession.next(session);
    });

    socket.on('sessionData', (session: Session) => {
      this.currentSession.next(session);
    });

    socket.on('sessionError', (error) => {
      console.error('Session error:', error);
      this.currentSession.next(null);
    });

    socket.on('mapStatesUpdated', (session: Session) => {
      this.currentSession.next(session);
    });
  }

  createSession(
    logo: string,
    leftTeam: string,
    leftLogo: string,
    rightTeam: string,
    rightLogo: string,
    bestOf: number,
    mapList: string[],
    vetoOrder: vetoOrder[],
  ): void {
    const socket = this.socketService.getSocket();
    socket.emit('createSession', {
      logo,
      leftTeam,
      leftLogo,
      rightTeam,
      rightLogo,
      bestOf,
      mapList,
      vetoOrder,
    });
  }

  getSession(sessionId: string): void {
    const socket = this.socketService.getSocket();
    socket.emit('getSession', sessionId);
  }

  getCurrentSession(): Session | null {
    return this.currentSession.getValue();
  }

  updateMapState(sessionId: string, mapStates: MapState[]) {
    console.log('Updating map states:', mapStates);
    this.socketService.getSocket().emit('updateMapStates', {
      sessionId,
      mapStates,
    });
  }
  finishSession(sessionId: string) {
    this.socketService.getSocket().emit('finishSession', sessionId);
  }
}
