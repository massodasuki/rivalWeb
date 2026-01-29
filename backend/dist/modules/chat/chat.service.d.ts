import { Repository } from 'typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatMessage } from './entities/chat-message.entity';
export declare class ChatService {
    private roomsRepository;
    private messagesRepository;
    constructor(roomsRepository: Repository<ChatRoom>, messagesRepository: Repository<ChatMessage>);
    findAllRooms(): Promise<ChatRoom[]>;
    findRoom(id: number): Promise<ChatRoom>;
    createRoom(data: Partial<ChatRoom>): Promise<ChatRoom>;
    getMessages(roomId: number): Promise<ChatMessage[]>;
    saveMessage(data: Partial<ChatMessage>): Promise<ChatMessage>;
    removeRoom(id: number): Promise<void>;
}
