import { useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket, isSocketConnected } from '../services/socketService';

/**
 * Hook for managing the shared socket connection.
 * Multiple components can call this hook — they all share the same underlying socket.
 */
export const useSocket = (token?: string) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);
    socketRef.current = socket;

    setConnected(socket.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      // Do NOT disconnect here — the socket is shared across the app.
      // disconnectSocket() is called explicitly on logout.
    };
  }, [token]);

  // Disconnect on full unmount (e.g. when the root component unmounts)
  useEffect(() => {
    return () => {
      disconnectSocket();
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
