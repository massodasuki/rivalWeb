import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(): Promise<import("./entities/notification.entity").Notification[]>;
    findByUser(userId: number): Promise<import("./entities/notification.entity").Notification[]>;
    create(data: {
        user_id: number;
        type?: string;
        message?: string;
    }): Promise<import("./entities/notification.entity").Notification>;
    markAsRead(id: number): Promise<import("./entities/notification.entity").Notification>;
    remove(id: number): Promise<void>;
}
