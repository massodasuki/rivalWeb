import { Module } from '@nestjs/common';
import { NotificationWorker } from './notification.worker';
import { LeaderboardWorker } from './leaderboard.worker';
import { MatchResultsWorker } from './match-results.worker';

@Module({
  providers: [NotificationWorker, LeaderboardWorker, MatchResultsWorker],
  exports: [NotificationWorker, LeaderboardWorker, MatchResultsWorker],
})
export class WorkersModule {}
