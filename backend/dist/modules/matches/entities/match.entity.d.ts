import { Team } from '../../teams/entities/team.entity';
import { MatchParticipant } from './match-participant.entity';
import { MatchStat } from './match-stat.entity';
export declare class Match {
    id: number;
    home_team_id: number;
    away_team_id: number;
    home_team_name: string;
    away_team_name: string;
    max_players: number;
    description: string;
    sport: string;
    location: string;
    scheduled_at: Date;
    status: string;
    created_at: Date;
    updated_at: Date;
    home_team: Team;
    away_team: Team;
    participants: MatchParticipant[];
    stats: MatchStat[];
}
