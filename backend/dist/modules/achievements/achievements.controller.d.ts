import { AchievementsService } from './achievements.service';
export declare class AchievementsController {
    private achievementsService;
    constructor(achievementsService: AchievementsService);
    findAll(): Promise<import("./entities/achievement.entity").Achievement[]>;
    findByUser(userId: number): Promise<import("./entities/achievement.entity").Achievement[]>;
    create(data: {
        user_id: number;
        type?: string;
        value?: number;
    }): Promise<import("./entities/achievement.entity").Achievement>;
    updateValue(data: {
        user_id: number;
        type: string;
        value: number;
    }): Promise<import("./entities/achievement.entity").Achievement>;
    remove(id: number): Promise<void>;
}
