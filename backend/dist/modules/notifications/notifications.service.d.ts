import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
export declare class NotificationsService {
    private notificationsRepository;
    constructor(notificationsRepository: Repository<Notification>);
    findAll(): Promise<Notification[]>;
    findByUser(userId: number): Promise<Notification[]>;
    create(data: Partial<Notification>): Promise<Notification>;
    markAsRead(id: number): Promise<Notification>;
    remove(id: number): Promise<void>;
}
