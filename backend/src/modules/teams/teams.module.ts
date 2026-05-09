import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';
import { TeamInvitation } from './entities/team-invitation.entity';
import { UsersModule } from '../users/users.module';
import { ActivityLog } from '../users/entities/activity-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, TeamMember, TeamInvitation, ActivityLog]),
    UsersModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
