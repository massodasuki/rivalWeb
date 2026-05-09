import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,  // 1 minute window
        limit: 60,   // 60 requests per minute globally
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'rival_user',
      password: process.env.DB_PASSWORD || 'rival_pass',
      database: process.env.DB_DATABASE || 'rival_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // Only auto-sync in local dev when explicitly opted in — never in staging/prod
      synchronize: process.env.DB_SYNC === 'true',
      logging: process.env.DB_LOGGING
        ? (process.env.DB_LOGGING.split(',') as any)
        : process.env.NODE_ENV !== 'production'
          ? ['error', 'warn']
          : ['error'],
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
    LeaderboardModule,
  ],
  providers: [
    // Apply throttler globally — auth controller overrides with stricter limits
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
