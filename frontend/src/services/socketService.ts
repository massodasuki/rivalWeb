import { io, Socket } from 'socket.io-client';

// Socket singleton — one connection shared across the entire app
let socket: Socket | null = null;
let currentToken: string | null = null;

const getBackendUrl = (): string => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (backendUrl && backendUrl.trim() !== '') {
    return backendUrl;
  }
  return '';
};

/**
 * Get or create the socket connection.
 * Returns the existing socket if it is already connected with the same token.
 * Only creates a new connection when there is no live socket or the token changed.
 */
export const getSocket = (token?: string): Socket => {
  const resolvedToken = token || localStorage.getItem('authToken');

  // Reuse existing connected socket if the token hasn't changed
  if (socket && socket.connected && resolvedToken === currentToken) {
    return socket;
  }

  // Disconnect stale socket before creating a new one
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentToken = resolvedToken;

  const backendUrl = getBackendUrl();
  const socketUrl = backendUrl ? `${backendUrl}/socket.io` : '/socket.io';

  socket = io(socketUrl, {
    auth: { token: resolvedToken },
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

  return socket;
};

/**
 * Reconnect socket with a fresh token (call after login / token refresh).
 */
export const reconnectSocketWithToken = (): Socket => {
  currentToken = null; // Force new connection
  return getSocket();
};

/**
 * Disconnect and destroy the socket connection.
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
};

/**
 * Check if the socket is currently connected.
 */
export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};

export default {
  getSocket,
  reconnectSocketWithToken,
  disconnectSocket,
  isSocketConnected,
};
