import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import { ChannelModel, Channel } from 'amqplib';
import { QUEUES, ROUTING_KEYS } from '../../common/constants/queues';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private connection: ChannelModel;
  private channel: Channel;
  private readonly logger = new Logger(RabbitmqService.name);

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Assert queues
      await this.channel.assertQueue(QUEUES.NOTIFICATIONS, { durable: true });
      await this.channel.assertQueue(QUEUES.TEAM_INVITES, { durable: true });
      await this.channel.assertQueue(QUEUES.MATCH_INVITES, { durable: true });
      await this.channel.assertQueue(QUEUES.LEADERBOARD_CACHE, { durable: true });
      await this.channel.assertQueue(QUEUES.MATCH_RESULTS, { durable: true });

      // Bind queues to exchange
      await this.channel.bindQueue(QUEUES.NOTIFICATIONS, '', ROUTING_KEYS.TEAM_INVITE);
      await this.channel.bindQueue(QUEUES.NOTIFICATIONS, '', ROUTING_KEYS.MATCH_INVITE);

      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
    }
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
    try {
      this.channel.publish('', routingKey, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
      this.logger.debug(`Message published with routing key: ${routingKey}`);
    } catch (error) {
      this.logger.error(`Error publishing with routing key: ${routingKey}`, error);
    }
  }

  async consume(queue: string, callback: (msg: any) => Promise<void>) {
    await this.channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          this.channel.ack(msg);
        } catch (error) {
          this.logger.error(`Error processing message from queue: ${queue}`, error);
          this.channel.nack(msg, false, false);
        }
      }
    });
  }

  getChannel() {
    return this.channel;
  }
}
