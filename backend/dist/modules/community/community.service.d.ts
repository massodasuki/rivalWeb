import { Repository } from 'typeorm';
import { CommunityPost } from './entities/community-post.entity';
export declare class CommunityService {
    private postsRepository;
    constructor(postsRepository: Repository<CommunityPost>);
    findAll(): Promise<CommunityPost[]>;
    findOne(id: number): Promise<CommunityPost>;
    create(data: Partial<CommunityPost>): Promise<CommunityPost>;
    update(id: number, updateData: Partial<CommunityPost>): Promise<CommunityPost>;
    remove(id: number): Promise<void>;
    reply(id: number, data: {
        user_id: number;
        content: string;
    }): Promise<{
        status: string;
    }>;
    registerEvent(data: {
        user_id: number;
        event_id: number;
    }): Promise<{
        status: string;
    }>;
    joinEvent(data: {
        user_id: number;
        event_id: number;
    }): Promise<{
        status: string;
    }>;
}
