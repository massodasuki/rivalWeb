import { User } from '../../users/entities/user.entity';
export declare class CommunityPost {
    id: number;
    user_id: number;
    title: string;
    content: string;
    type: string;
    created_at: Date;
    user: User;
}
