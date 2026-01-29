import { MatchesService } from './matches.service';
export declare class MatchesController {
    private matchesService;
    constructor(matchesService: MatchesService);
    findAll(): Promise<import("./entities/match.entity").Match[]>;
    findOne(id: number): Promise<import("./entities/match.entity").Match>;
    create(data: {
        home_team_id?: number;
        away_team_id?: number;
        sport: string;
        scheduled_at: string;
    }): Promise<import("./entities/match.entity").Match>;
    addParticipant(id: number, body: {
        user_id: number;
        role?: string;
    }): Promise<import("./entities/match-participant.entity").MatchParticipant>;
    updateStats(id: number, body: {
        user_id: number;
        goals?: number;
        assists?: number;
        rating?: number;
    }): Promise<import("./entities/match-stat.entity").MatchStat>;
    updateStatus(id: number, body: {
        status: string;
    }): Promise<import("./entities/match.entity").Match>;
    remove(id: number): Promise<void>;
}
