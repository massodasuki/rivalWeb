import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FriendshipsModule } from './modules/friendships/friendships.module';
import { TeamsModule } from './modules/teams/teams.module';
import { MatchesModule } from './modules/matches/matches.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChatModule } from './modules/chat/chat.module';
import { CommunityModule } from './modules/community/community.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { SocketModule } from './modules/socket/socket.module';
import { RabbitmqModule } from './modules/rabbitmq/rabbitmq.module';
import { RedisModule } from './modules/redis/redis.module';
import { WorkersModule } from './workers/workers.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'rival_user',
      password: process.env.DB_PASSWORD || 'rival_pass',
      database: process.env.DB_DATABASE || 'rival_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    RabbitmqModule,
    RedisModule,
    AuthModule,
    UsersModule,
    FriendshipsModule,
    TeamsModule,
    MatchesModule,
    NotificationsModule,
    ChatModule,
    CommunityModule,
    AchievementsModule,
    SocketModule,
    WorkersModule,
    HealthModule,
  ],
})
export class AppModule {}