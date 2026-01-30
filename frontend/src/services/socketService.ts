import { io, Socket } from 'socket.io-client';

// Socket instance singleton
let socket: Socket | null = null;

// Use environment variable or fallback to default (supports Docker and local dev)
const getBackendUrl = () => {
  // Check for environment variable (set in .env or docker-compose)
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  // Default to localhost:3001 for local development
  return 'http://localhost:3001';
};

/**
 * Get or create the socket connection
 * @param token - JWT authentication token
 * @returns Socket instance
 */
export const getSocket = (token?: string): Socket => {
  if (!socket) {
    const backendUrl = getBackendUrl();
    socket = io(`${backendUrl}/socket.io`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error.message);
    });
  }

  // Update token if provided
  if (token) {
    socket.auth = { token };
  }

  return socket;
};

/**
 * Disconnect the socket connection
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};

export default {
  getSocket,
  disconnectSocket,
  isSocketConnected,
};
