import { ChatRoom } from './chat-room.entity';
import { User } from '../../auth/entities/user.entity';
export declare class ChatMessage {
    id: number;
    room_id: number;
    sender_id: number;
    message: string;
    created_at: Date;
    room: ChatRoom;
    sender: User;
}
