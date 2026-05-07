import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { MatchParticipant } from '../matches/entities/match-participant.entity';
import { MatchStat } from '../matches/entities/match-stat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, MatchParticipant, MatchStat])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}