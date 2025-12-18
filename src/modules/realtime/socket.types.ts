// src/modules/realtime/socket.types.ts
import type { Server, Socket } from 'socket.io';

export interface ServerToClientEvents {
  'notification:new': (payload: { notifID: string; message: string }) => void;
  'notification:count': (payload: { unreadCount: number }) => void;
  'video:processed': (payload: { vidID: string }) => void;
}

export interface ClientToServerEvents {
  'notification:subscribe': (userID: string) => void;
  'notification:unsubscribe': (userID: string) => void;
}

export type VITVerseSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export type VITVerseIO = Server<ClientToServerEvents, ServerToClientEvents>;
