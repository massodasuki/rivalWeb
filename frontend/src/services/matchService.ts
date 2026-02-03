import { get, post, patch, del } from './api';

// Types for matches (matching backend entity)
export interface Match {
  id: number;
  home_team_id?: number;
  away_team_id?: number;
  home_team_name?: string;
  away_team_name?: string;
  sport: string;
  location?: string;
  scheduled_at: string;
  status?: string;
  max_players?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
  // Relations (populated by backend) - can be string or object
  home_team?: string | {
    id: number;
    name: string;
  };
  away_team?: string | {
    id: number;
    name: string;
  };
  // Additional fields for UI
  teams?: string;
  time?: string;
  players?: string;
  price?: string;
}

export interface MatchParticipant {
  id?: number;
  match_id?: number;
  user_id: number;
  role?: string;
  goals?: number;
  assists?: number;
  rating?: number;
}

export interface MatchStat {
  id: number;
  match_id: number;
  user_id: number;
  goals?: number;
  assists?: number;
  rating?: number;
}

export interface CreateMatchData {
  home_team_id?: number;
  away_team_id?: number;
  sport: string;
  scheduled_at: string;
  location?: string;
  // Team names (for when not using team IDs)
  home_team?: string;
  away_team?: string;
  max_players?: number;
  description?: string;
}

export interface UpdateMatchStatusData {
  status: string;
}

// Match API functions
export const matchService = {
  // Get all matches
  async getMatches(params?: Record<string, string>): Promise<Match[]> {
    return get<Match[]>('/api/matches', params);
  },

  // Get a single match by ID
  async getMatch(id: number): Promise<Match> {
    return get<Match>(`/api/matches/${id}`);
  },

  // Create a new match
  async createMatch(data: CreateMatchData): Promise<Match> {
    return post<Match>('/api/matches', data);
  },

  // Add a participant to a match
  async addParticipant(matchId: number, data: MatchParticipant): Promise<void> {
    return post(`/api/matches/${matchId}/participants`, data);
  },

  // Update match stats for a participant
  async updateMatchStats(matchId: number, data: MatchParticipant): Promise<void> {
    return post(`/api/matches/${matchId}/stats`, data);
  },

  // Update match status
  async updateMatchStatus(matchId: number, data: UpdateMatchStatusData): Promise<Match> {
    return patch<Match>(`/api/matches/${matchId}/status`, data);
  },

  // Delete a match
  async deleteMatch(id: number): Promise<void> {
    return del(`/api/matches/${id}`);
  },
};

export default matchService;
