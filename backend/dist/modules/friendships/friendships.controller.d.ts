import { FriendshipsService } from './friendships.service';
export declare class FriendshipsController {
    private friendshipsService;
    constructor(friendshipsService: FriendshipsService);
    findAll(): Promise<import("./entities/friendship.entity").Friendship[]>;
    findByUser(userId: number): Promise<import("./entities/friendship.entity").Friendship[]>;
    create(body: {
        user_id: number;
        friend_id: number;
    }): Promise<import("./entities/friendship.entity").Friendship>;
    updateStatus(id: number, body: {
        status: string;
    }): Promise<import("./entities/friendship.entity").Friendship>;
    remove(id: number): Promise<void>;
}
