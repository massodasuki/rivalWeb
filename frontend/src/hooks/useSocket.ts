import { useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket, isSocketConnected } from '../services/socketService';

/**
 * Hook for managing socket connection
 * @param token - JWT authentication token
 * @returns Object containing socket instance and connection status
 */
export const useSocket = (token?: string) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    // Get or create socket connection
    const socket = getSocket(token);
    socketRef.current = socket;

    // Set connection status
    setConnected(socket.connected);

    // Listen for connection events
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Cleanup on unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [token]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current && !socketRef.current.connected) {
        disconnectSocket();
      }
    };
  }, []);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setConnected(false);
  }, []);

  return {
    socket: socketRef.current,
    connected,
    disconnect,
    isSocketConnected,
  };
};

export default useSocket;
