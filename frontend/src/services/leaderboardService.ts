import { get } from './api';

export interface LeaderboardEntry {
  rank: number;
  teamId: number;
  teamName: string;
  sport: string;
  wins: number;
  points: number;
}

export const leaderboardService = {
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return get<LeaderboardEntry[]>('/api/leaderboard');
  },
};
