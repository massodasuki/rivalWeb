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
    update(id: number, data: Partial<{
        title: string;
        content: string;
        type: string;
    }>): Promise<import("./entities/community-post.entity").CommunityPost>;
    remove(id: number): Promise<void>;
}
