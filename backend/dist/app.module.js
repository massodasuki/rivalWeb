"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const friendships_module_1 = require("./modules/friendships/friendships.module");
const teams_module_1 = require("./modules/teams/teams.module");
const matches_module_1 = require("./modules/matches/matches.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const chat_module_1 = require("./modules/chat/chat.module");
const community_module_1 = require("./modules/community/community.module");
const achievements_module_1 = require("./modules/achievements/achievements.module");
const socket_module_1 = require("./modules/socket/socket.module");
const rabbitmq_module_1 = require("./modules/rabbitmq/rabbitmq.module");
const redis_module_1 = require("./modules/redis/redis.module");
const workers_module_1 = require("./workers/workers.module");
const health_module_1 = require("./modules/health/health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'default',
                    ttl: 60000,
                    limit: 60,
                },
            ]),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT) || 5432,
                username: process.env.DB_USERNAME || 'rival_user',
                password: process.env.DB_PASSWORD || 'rival_pass',
                database: process.env.DB_DATABASE || 'rival_db',
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: process.env.DB_SYNC === 'true',
                logging: process.env.DB_LOGGING
                    ? process.env.DB_LOGGING.split(',')
                    : process.env.NODE_ENV !== 'production'
                        ? ['error', 'warn']
                        : ['error'],
            }),
            rabbitmq_module_1.RabbitmqModule,
            redis_module_1.RedisModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            friendships_module_1.FriendshipsModule,
            teams_module_1.TeamsModule,
            matches_module_1.MatchesModule,
            notifications_module_1.NotificationsModule,
            chat_module_1.ChatModule,
            community_module_1.CommunityModule,
            achievements_module_1.AchievementsModule,
            socket_module_1.SocketModule,
            workers_module_1.WorkersModule,
            health_module_1.HealthModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map