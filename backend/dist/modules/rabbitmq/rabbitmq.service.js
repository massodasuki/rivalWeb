"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RabbitmqService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitmqService = void 0;
const common_1 = require("@nestjs/common");
const amqp = require("amqplib");
const queues_1 = require("../../common/constants/queues");
let RabbitmqService = RabbitmqService_1 = class RabbitmqService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.logger = new common_1.Logger(RabbitmqService_1.name);
        this.reconnectTimer = null;
    }
    async onModuleInit() {
        await this.connect();
    }
    async onModuleDestroy() {
        if (this.reconnectTimer)
            clearTimeout(this.reconnectTimer);
        await this.disconnect();
    }
    async connect() {
        try {
            const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
            this.logger.log(`Connecting to RabbitMQ: ${url}`);
            this.connection = await amqp.connect(url);
            this.logger.log('RabbitMQ connection established');
            this.connection.on('error', (err) => {
                this.logger.error('RabbitMQ connection error:', err);
            });
            this.connection.on('close', () => {
                this.logger.warn('RabbitMQ connection closed — scheduling reconnect in 5s');
                this.channel = null;
                this.connection = null;
                this.scheduleReconnect();
            });
            this.channel = await this.connection.createChannel();
            this.logger.log('RabbitMQ channel created');
            this.channel.on('error', (err) => {
                this.logger.error('RabbitMQ channel error:', err);
                this.channel = null;
            });
            this.channel.on('close', () => {
                this.logger.warn('RabbitMQ channel closed');
                this.channel = null;
            });
            await this.channel.assertQueue(queues_1.QUEUES.NOTIFICATIONS, { durable: true });
            await this.channel.assertQueue(queues_1.QUEUES.TEAM_INVITES, { durable: true });
            await this.channel.assertQueue(queues_1.QUEUES.MATCH_INVITES, { durable: true });
            await this.channel.assertQueue(queues_1.QUEUES.LEADERBOARD_CACHE, { durable: true });
            await this.channel.assertQueue(queues_1.QUEUES.MATCH_RESULTS, { durable: true });
            await this.channel.assertExchange(queues_1.EXCHANGES.NOTIFICATIONS, 'topic', { durable: true });
            await this.channel.bindQueue(queues_1.QUEUES.NOTIFICATIONS, queues_1.EXCHANGES.NOTIFICATIONS, queues_1.ROUTING_KEYS.TEAM_INVITE);
            await this.channel.bindQueue(queues_1.QUEUES.NOTIFICATIONS, queues_1.EXCHANGES.NOTIFICATIONS, queues_1.ROUTING_KEYS.MATCH_INVITE);
            await this.channel.bindQueue(queues_1.QUEUES.LEADERBOARD_CACHE, queues_1.EXCHANGES.NOTIFICATIONS, queues_1.ROUTING_KEYS.LEADERBOARD_UPDATE);
            await this.channel.bindQueue(queues_1.QUEUES.MATCH_RESULTS, queues_1.EXCHANGES.NOTIFICATIONS, queues_1.ROUTING_KEYS.MATCH_COMPLETED);
            this.logger.log('RabbitMQ fully connected and configured');
        }
        catch (error) {
            this.logger.error('Failed to connect to RabbitMQ', error);
            this.scheduleReconnect();
        }
    }
    scheduleReconnect() {
        if (this.reconnectTimer)
            return;
        this.reconnectTimer = setTimeout(async () => {
            this.reconnectTimer = null;
            this.logger.log('Attempting RabbitMQ reconnect...');
            await this.connect();
        }, 5000);
    }
    async disconnect() {
        try {
            if (this.channel)
                await this.channel.close();
            if (this.connection)
                await this.connection.close();
            this.logger.log('Disconnected from RabbitMQ');
        }
        catch (error) {
            this.logger.error('Error disconnecting from RabbitMQ', error);
        }
    }
    async publishToQueue(queue, message) {
        if (!this.channel) {
            this.logger.warn(`RabbitMQ channel not available — skipping publish to queue: ${queue}`);
            return;
        }
        try {
            this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                persistent: true,
            });
            this.logger.debug(`Message published to queue: ${queue}`);
        }
        catch (error) {
            this.logger.error(`Error publishing to queue: ${queue}`, error);
        }
    }
    async publishWithRoutingKey(routingKey, message) {
        if (!this.channel) {
            this.logger.warn(`RabbitMQ channel not available — skipping publish with routing key: ${routingKey}`);
            return;
        }
        try {
            this.channel.publish(queues_1.EXCHANGES.NOTIFICATIONS, routingKey, Buffer.from(JSON.stringify(message)), { persistent: true });
            this.logger.debug(`Message published with routing key: ${routingKey}`);
        }
        catch (error) {
            this.logger.error(`Error publishing with routing key: ${routingKey}`, error);
        }
    }
    async consume(queue, callback) {
        if (!this.channel) {
            this.logger.warn(`RabbitMQ channel not available — cannot consume from queue: ${queue}`);
            return;
        }
        await this.channel.consume(queue, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    await callback(content);
                    this.channel?.ack(msg);
                }
                catch (error) {
                    this.logger.error(`Error processing message from queue: ${queue}`, error);
                    this.channel?.nack(msg, false, false);
                }
            }
        });
    }
    getChannel() {
        return this.channel;
    }
    isReady() {
        return this.channel !== null;
    }
};
exports.RabbitmqService = RabbitmqService;
exports.RabbitmqService = RabbitmqService = RabbitmqService_1 = __decorate([
    (0, common_1.Injectable)()
], RabbitmqService);
//# sourceMappingURL=rabbitmq.service.js.map