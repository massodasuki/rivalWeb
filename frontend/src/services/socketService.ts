import { io, Socket } from 'socket.io-client';

// Socket instance singleton
let socket: Socket | null = null;

// Use environment variable or fallback to same-origin (supports proxy/nginx)
const getBackendUrl = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (backendUrl && backendUrl.trim() !== '') {
    return backendUrl;
  }
  // Empty string means same-origin (Vite proxy or Nginx)
  return '';
};

// Get frontend URL for CORS
const getFrontendUrl = () => {
  if (import.meta.env.VITE_FRONTEND_URL) {
    return import.meta.env.VITE_FRONTEND_URL;
  }
  // Default ports for common development setups
  return 'http://localhost:3000';
};

/**
 * Get or create the socket connection
 * @param token - JWT authentication token
 * @returns Socket instance
 */
export const getSocket = (token?: string): Socket => {
  // Always disconnect existing socket and create a new one with the token
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const backendUrl = getBackendUrl();
  const socketUrl = backendUrl ? `${backendUrl}/socket.io` : '/socket.io';

  socket = io(socketUrl, {
    auth: { token: token || localStorage.getItem('authToken') },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    forceNew: true, // Always create a new connection
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

  return socket;
};

/**
 * Reconnect socket with a new token (for login/token refresh)
 */
export const reconnectSocketWithToken = (): Socket => {
  const token = localStorage.getItem('authToken') || undefined;
  return getSocket(token);
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
