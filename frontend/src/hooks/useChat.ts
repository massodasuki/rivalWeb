import { useEffect, useState, useCallback, useRef } from 'react';
import { getSocket, isSocketConnected } from '../services/socketService';
import { ChatMessage, UserTyping } from '../vite-env';

/**
 * Hook for managing chat functionality via WebSocket
 * @param token - JWT authentication token
 * @param roomId - Current chat room ID
 * @returns Object containing chat state and methods
 */
export const useChat = (token?: string, roomId?: number) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<number, UserTyping>>(new Map());
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;

    socketRef.current = getSocket(token);

    // Listen for new messages
    const handleNewMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    // Listen for typing indicators
    const handleUserTyping = (data: UserTyping) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        if (data.isTyping) {
          next.set(data.userId, data);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    };

    socketRef.current.on('chat:newMessage', handleNewMessage);
    socketRef.current.on('chat:userTyping', handleUserTyping);

    return () => {
      socketRef.current?.off('chat:newMessage', handleNewMessage);
      socketRef.current?.off('chat:userTyping', handleUserTyping);
    };
  }, [token]);

  // Join/leave room when roomId changes
  useEffect(() => {
    if (!socketRef.current || !roomId) return;

    if (isSocketConnected()) {
      socketRef.current.emit('chat:joinRoom', { roomId });
    }

    return () => {
      if (isSocketConnected()) {
        socketRef.current?.emit('chat:leaveRoom', { roomId });
      }
      setMessages([]);
      setTypingUsers(new Map());
    };
  }, [roomId]);

  const sendMessage = useCallback((content: string, messageType: 'text' | 'image' | 'file' = 'text') => {
    if (!socketRef.current || !roomId) return;

    socketRef.current.emit('chat:sendMessage', {
      roomId,
      content,
      messageType,
    });
  }, [roomId]);

  const startTyping = useCallback(() => {
    if (!socketRef.current || !roomId) return;

    socketRef.current.emit('chat:typingStart', {
      roomId,
      userId: 0, // Will be set by server from socket auth
      isTyping: true,
    });
  }, [roomId]);

  const stopTyping = useCallback(() => {
    if (!socketRef.current || !roomId) return;

    socketRef.current.emit('chat:typingStop', {
      roomId,
      userId: 0,
      isTyping: false,
    });
  }, [roomId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    typingUsers: Array.from(typingUsers.values()),
    sendMessage,
    startTyping,
    stopTyping,
    clearMessages,
  };
};

export default useChat;
