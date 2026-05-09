import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { ActivityLog } from './entities/activity-log.entity';
import { MatchParticipant } from '../matches/entities/match-participant.entity';
import { MatchStat } from '../matches/entities/match-stat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, MatchParticipant, MatchStat, ActivityLog])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}