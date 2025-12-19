// src/modules/realtime/socket.types.ts
import type { Server, Socket } from 'socket.io';

export interface ServerToClientEvents {
  'notification:new': (payload: { notifID: string; message: string; type: string }) => void;
  'notification:count': (payload: { unreadCount: number }) => void;
  'video:processed': (payload: { vidID: string }) => void;
  'subscription:new': (payload: { channelID: string; channelName: string }) => void;
  'comment:new': (payload: { vidID: string; commentID: string; userName: string; text: string }) => void;
  'like:new': (payload: { vidID: string; userName: string }) => void;
  'channel:update': (payload: { channelID: string; message: string }) => void;
}

export interface ClientToServerEvents {
  'notification:subscribe': (userID: string) => void;
  'notification:unsubscribe': (userID: string) => void;
}

export type VITVerseSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export type VITVerseIO = Server<ClientToServerEvents, ServerToClientEvents>;
