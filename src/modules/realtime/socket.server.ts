// src/modules/realtime/socket.server.ts
import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { VITVerseIO, VITVerseSocket } from './socket.types';
import { registerSocketHandlers } from './socket.handlers';

let ioInstance: VITVerseIO | null = null;

export function initSocketIO(httpServer: HTTPServer): VITVerseIO {
  if (ioInstance) return ioInstance;

  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance.on('connection', (socket: VITVerseSocket) => {
    registerSocketHandlers(ioInstance!, socket);
  });

  return ioInstance;
}

export function getIO(): VITVerseIO {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized');
  }
  return ioInstance;
}
