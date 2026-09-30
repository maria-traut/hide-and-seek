import { io, Socket } from 'socket.io-client';

export const socket: Socket = io(import.meta.env.BACKEND_URL, {
  autoConnect: false,
});
