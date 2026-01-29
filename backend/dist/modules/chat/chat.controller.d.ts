import { ChatService } from './chat.service';
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    findAllRooms(): Promise<import("./entities/chat-room.entity").ChatRoom[]>;
    findRoom(id: number): Promise<import("./entities/chat-room.entity").ChatRoom>;
    createRoom(data: {
        type?: string;
        name?: string;
    }): Promise<import("./entities/chat-room.entity").ChatRoom>;
    getMessages(id: number): Promise<import("./entities/chat-message.entity").ChatMessage[]>;
    saveMessage(data: {
        room_id: number;
        sender_id: number;
        message: string;
    }): Promise<import("./entities/chat-message.entity").ChatMessage>;
    removeRoom(id: number): Promise<void>;
}
