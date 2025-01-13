// src/app/services/session.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface Session {
  id: string;
  leftTeam: string;
  rightTeam: string;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessions = new Map<string, Session>();
  private currentSession = new BehaviorSubject<Session | null>(null);
  currentSession$ = this.currentSession.asObservable();
  private readonly STORAGE_KEY = 'valo-map-veto';

  constructor() {
    this.loadSessions();
  }

  private loadSessions() {
    const savedSessions = localStorage.getItem(this.STORAGE_KEY);
    if (savedSessions) {
      const sessionsArray = JSON.parse(savedSessions);
      sessionsArray.forEach((session: Session) => {
        this.sessions.set(session.id, session);
      });
      console.log('Loaded sessions:', this.sessions);
    }
  }

  private saveSessions() {
    const sessionsArray = Array.from(this.sessions.values());
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionsArray));
  }

  createSession(leftTeam: string, rightTeam: string): string {
    const session: Session = {
      id: uuidv4(),
      leftTeam,
      rightTeam
    };
    this.sessions.set(session.id, session);
    this.currentSession.next(session);
    this.saveSessions();
    console.log('Created session:', session);
    return session.id;
  }

  getSession(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    console.log('Getting session:', sessionId, session);
    if (session) {
      this.currentSession.next(session);
      return session;
    }
    return undefined;
  }

  getCurrentSession(): Session | null {
    return this.currentSession.getValue();
  }

  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }
}