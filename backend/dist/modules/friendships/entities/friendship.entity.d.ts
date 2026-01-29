import { User } from '../../auth/entities/user.entity';
export declare class Friendship {
    id: number;
    user_id: number;
    friend_id: number;
    status: string;
    created_at: Date;
    user: User;
    friend: User;
}
