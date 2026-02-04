import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
export declare class RabbitmqService implements OnModuleInit, OnModuleDestroy {
    private connection;
    private channel;
    private readonly logger;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private connect;
    private disconnect;
    publishToQueue(queue: string, message: any): Promise<void>;
    publishWithRoutingKey(routingKey: string, message: any): Promise<void>;
    consume(queue: string, callback: (msg: any) => Promise<void>): Promise<void>;
    getChannel(): amqp.Channel;
}
