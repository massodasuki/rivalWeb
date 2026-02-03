import { get, post } from './api';

export interface ChatRoom {
  id: number;
  name?: string;
  type?: string;
}

export interface ChatMessage {
  id: number;
  room_id: number;
  sender_id: number;
  message: string;
  created_at?: string;
}

export interface SendMessageData {
  room_id: number;
  sender_id: number;
  message: string;
}

export const chatService = {
  async getRooms(): Promise<ChatRoom[]> {
    return get<ChatRoom[]>('/chat/rooms');
  },

  async getMessages(roomId: number): Promise<ChatMessage[]> {
    return get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`);
  },

  async sendMessage(data: SendMessageData): Promise<ChatMessage> {
    return post<ChatMessage>('/chat/messages', data);
  },
};

export default chatService;
