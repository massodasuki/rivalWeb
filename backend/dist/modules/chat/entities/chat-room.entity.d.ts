import { ChatMessage } from './chat-message.entity';
export declare class ChatRoom {
    id: number;
    type: string;
    name: string;
    created_at: Date;
    messages: ChatMessage[];
}
