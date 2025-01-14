import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Config } from '../shared/config';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor(private config: Config) {
    this.socket = io(this.config.serverUrl);
  }

  getSocket(): Socket {
    return this.socket;
  }
}
