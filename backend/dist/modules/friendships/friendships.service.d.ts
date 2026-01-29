import { Repository } from 'typeorm';
import { Friendship } from './entities/friendship.entity';
export declare class FriendshipsService {
    private friendshipsRepository;
    constructor(friendshipsRepository: Repository<Friendship>);
    findAll(): Promise<Friendship[]>;
    findByUser(userId: number): Promise<Friendship[]>;
    create(userId: number, friendId: number): Promise<Friendship>;
    updateStatus(id: number, status: string): Promise<Friendship>;
    remove(id: number): Promise<void>;
}
