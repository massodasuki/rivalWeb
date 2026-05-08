import { User } from '../../users/entities/user.entity';
export declare class Notification {
    id: number;
    user_id: number;
    type: string;
    message: string;
    read: boolean;
    created_at: Date;
    user: User;
}
