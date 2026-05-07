import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import { ChannelModel, Channel } from 'amqplib';
import { QUEUES, ROUTING_KEYS, EXCHANGES } from '../../common/constants/queues';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly logger = new Logger(RabbitmqService.name);
  private reconnectTimer: NodeJS.Timeout | null = null;

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    await this.disconnect();
  }

  private async connect() {
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

      // Assert queues
      await this.channel.assertQueue(QUEUES.NOTIFICATIONS, { durable: true });
      await this.channel.assertQueue(QUEUES.TEAM_INVITES, { durable: true });
      await this.channel.assertQueue(QUEUES.MATCH_INVITES, { durable: true });
      await this.channel.assertQueue(QUEUES.LEADERBOARD_CACHE, { durable: true });
      await this.channel.assertQueue(QUEUES.MATCH_RESULTS, { durable: true });

      // Assert exchange and bind queues
      await this.channel.assertExchange(EXCHANGES.NOTIFICATIONS, 'topic', { durable: true });
      await this.channel.bindQueue(QUEUES.NOTIFICATIONS, EXCHANGES.NOTIFICATIONS, ROUTING_KEYS.TEAM_INVITE);
      await this.channel.bindQueue(QUEUES.NOTIFICATIONS, EXCHANGES.NOTIFICATIONS, ROUTING_KEYS.MATCH_INVITE);
      await this.channel.bindQueue(QUEUES.LEADERBOARD_CACHE, EXCHANGES.NOTIFICATIONS, ROUTING_KEYS.LEADERBOARD_UPDATE);
      await this.channel.bindQueue(QUEUES.MATCH_RESULTS, EXCHANGES.NOTIFICATIONS, ROUTING_KEYS.MATCH_COMPLETED);

      this.logger.log('RabbitMQ fully connected and configured');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      this.logger.log('Attempting RabbitMQ reconnect...');
      await this.connect();
    }, 5000);
  }

  private async disconnect() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ', error);
    }
  }

  async publishToQueue(queue: string, message: any) {
    if (!this.channel) {
      this.logger.warn(`RabbitMQ channel not available — skipping publish to queue: ${queue}`);
      return;
    }
    try {
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
      this.logger.debug(`Message published to queue: ${queue}`);
    } catch (error) {
      this.logger.error(`Error publishing to queue: ${queue}`, error);
    }
  }

  async publishWithRoutingKey(routingKey: string, message: any) {
    if (!this.channel) {
      this.logger.warn(`RabbitMQ channel not available — skipping publish with routing key: ${routingKey}`);
      return;
    }
    try {
      this.channel.publish(
        EXCHANGES.NOTIFICATIONS,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true },
      );
      this.logger.debug(`Message published with routing key: ${routingKey}`);
    } catch (error) {
      this.logger.error(`Error publishing with routing key: ${routingKey}`, error);
    }
  }

  async consume(queue: string, callback: (msg: any) => Promise<void>) {
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
        } catch (error) {
          this.logger.error(`Error processing message from queue: ${queue}`, error);
          this.channel?.nack(msg, false, false);
        }
      }
    });
  }

  getChannel() {
    return this.channel;
  }

  isReady(): boolean {
    return this.channel !== null;
  }
}
