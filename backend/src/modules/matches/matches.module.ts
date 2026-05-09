import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Match } from './entities/match.entity';
import { MatchParticipant } from './entities/match-participant.entity';
import { MatchStat } from './entities/match-stat.entity';
import { ActivityLog } from '../users/entities/activity-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match, MatchParticipant, MatchStat, ActivityLog])],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}