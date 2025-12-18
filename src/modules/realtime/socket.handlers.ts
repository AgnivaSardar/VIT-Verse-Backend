// src/modules/realtime/socket.handlers.ts
import type { VITVerseIO, VITVerseSocket } from './socket.types';

/**
 * Helper: room name for a user
 */
function userRoom(userID: string) {
  return `user:${userID}`;
}

/**
 * Register all event handlers for a newly connected socket.
 */
export function registerSocketHandlers(io: VITVerseIO, socket: VITVerseSocket) {
  console.log('Socket connected', socket.id);

  /**
   * Client subscribes to its own notification room.
   * Frontend will call: socket.emit('notification:subscribe', userID)
   */
  socket.on('notification:subscribe', (userID: string) => {
    console.log(`Socket ${socket.id} subscribing to notifications for user ${userID}`);
    socket.join(userRoom(userID));
  });

  /**
   * Client unsubscribes from notifications (optional).
   */
  socket.on('notification:unsubscribe', (userID: string) => {
    console.log(`Socket ${socket.id} unsubscribing from notifications for user ${userID}`);
    socket.leave(userRoom(userID));
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id);
  });
}

/**
 * Helper functions to emit events from anywhere in backend.
 * Import these and pass in the IO instance from socket.server.ts.
 */
export const socketEvents = {
  /**
   * Emit a new notification to a specific user.
   */
  notifyUser(io: VITVerseIO, userID: string, payload: { notifID: string; message: string }) {
    io.to(userRoom(userID)).emit('notification:new', payload);
  },

  /**
   * Emit updated unread notification count to a user.
   */
  notifyUserCount(io: VITVerseIO, userID: string, unreadCount: number) {
    io.to(userRoom(userID)).emit('notification:count', { unreadCount });
  },

  /**
   * Emit that a video has finished processing to its uploader.
   */
  notifyVideoProcessed(io: VITVerseIO, userID: string, vidID: string) {
    io.to(userRoom(userID)).emit('video:processed', { vidID });
  },
};
