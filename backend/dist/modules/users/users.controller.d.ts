import { UsersService } from './users.service';
import { User } from './entities/user.entity';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User>;
    getStats(id: number): Promise<{
        matches: number;
        wins: number;
        losses: number;
        goals: number;
        assists: number;
        rating: number;
    }>;
    update(id: number, updateData: Partial<User>): Promise<User>;
    updateNotifications(id: number, data: Record<string, boolean>): Promise<{
        status: string;
    }>;
    updatePrivacy(id: number, data: Record<string, boolean>): Promise<{
        status: string;
    }>;
    updatePassword(id: number, data: {
        current_password: string;
        new_password: string;
    }): Promise<{
        status: string;
    }>;
    remove(id: number): Promise<void>;
}
