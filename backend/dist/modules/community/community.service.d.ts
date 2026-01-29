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
}
