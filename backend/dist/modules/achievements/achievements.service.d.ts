import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';
export declare class AchievementsService {
    private achievementsRepository;
    constructor(achievementsRepository: Repository<Achievement>);
    findAll(): Promise<Achievement[]>;
    findByUser(userId: number): Promise<Achievement[]>;
    create(data: Partial<Achievement>): Promise<Achievement>;
    updateValue(userId: number, type: string, value: number): Promise<Achievement>;
    remove(id: number): Promise<void>;
}
