import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
// import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  getSocket(): Socket {
    return this.socket;
  }
}