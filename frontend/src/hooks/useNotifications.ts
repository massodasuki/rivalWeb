import { useEffect, useState, useCallback, useRef } from 'react';
import { getSocket } from '../services/socketService';
import { Notification } from '../vite-env';

/**
 * Hook for managing notifications via WebSocket
 * @param token - JWT authentication token
 * @returns Object containing notifications state and methods
 */
export const useNotifications = (token?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;

    socketRef.current = getSocket(token);

    // Listen for new notifications
    const handleNotificationReceived = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socketRef.current.on('notification:received', handleNotificationReceived);

    return () => {
      socketRef.current?.off('notification:received', handleNotificationReceived);
    };
  }, [token]);

  const markAsRead = useCallback((notificationId: number) => {
    if (!socketRef.current) return;

    socketRef.current.emit('notification:markRead', { notificationId });

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    if (!socketRef.current) return;

    socketRef.current.emit('notification:markAllRead', {});

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((notificationId: number) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.filter((n) => n.id !== notificationId);
    });
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
  };
};

export default useNotifications;
