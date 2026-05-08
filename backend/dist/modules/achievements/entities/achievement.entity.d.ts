import { User } from '../../users/entities/user.entity';
export declare class Achievement {
    id: number;
    user_id: number;
    type: string;
    value: number;
    updated_at: Date;
    user: User;
}
