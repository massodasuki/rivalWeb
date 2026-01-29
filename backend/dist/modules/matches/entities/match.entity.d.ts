import { Team } from '../../teams/entities/team.entity';
export declare class Match {
    id: number;
    home_team_id: number;
    away_team_id: number;
    sport: string;
    location: string;
    scheduled_at: Date;
    status: string;
    created_at: Date;
    home_team: Team;
    away_team: Team;
}
