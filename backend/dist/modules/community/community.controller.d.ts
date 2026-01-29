import { CommunityService } from './community.service';
export declare class CommunityController {
    private communityService;
    constructor(communityService: CommunityService);
    findAll(): Promise<import("./entities/community-post.entity").CommunityPost[]>;
    findOne(id: number): Promise<import("./entities/community-post.entity").CommunityPost>;
    create(data: {
        user_id: number;
        title?: string;
        content?: string;
        type?: string;
    }): Promise<import("./entities/community-post.entity").CommunityPost>;
    update(id: number, data: Partial<{
        title: string;
        content: string;
        type: string;
    }>): Promise<import("./entities/community-post.entity").CommunityPost>;
    remove(id: number): Promise<void>;
}
