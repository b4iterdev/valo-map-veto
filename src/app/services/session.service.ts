import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SocketService } from './socket.service';

export interface Session {
  id: string;
  leftTeam: string;
  rightTeam: string;
}

@Injectable({
  providedIn: 'root'
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
  }

  createSession(leftTeam: string, rightTeam: string): void {
    const socket = this.socketService.getSocket();
    socket.emit('createSession', { leftTeam, rightTeam });
  }

  getSession(sessionId: string): void {
    const socket = this.socketService.getSocket();
    socket.emit('getSession', sessionId);
  }
}