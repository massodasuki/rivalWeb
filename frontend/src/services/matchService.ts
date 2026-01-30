import { get, post, patch, del } from './api';

// Types for matches
export interface Match {
  id: number;
  home_team_id?: number;
  away_team_id?: number;
  sport: string;
  scheduled_at: string;
  status?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
  // Additional fields for UI
  home_team?: string;
  away_team?: string;
  teams?: string;
  time?: string;
  players?: string;
  price?: string;
}

export interface MatchParticipant {
  user_id: number;
  role?: string;
  goals?: number;
  assists?: number;
  rating?: number;
}

export interface CreateMatchData {
  home_team_id?: number;
  away_team_id?: number;
  sport: string;
  scheduled_at: string;
}

export interface UpdateMatchStatusData {
  status: string;
}

// Match API functions
export const matchService = {
  // Get all matches
  async getMatches(): Promise<Match[]> {
    return get<Match[]>('/matches');
  },

  // Get a single match by ID
  async getMatch(id: number): Promise<Match> {
    return get<Match>(`/matches/${id}`);
  },

  // Create a new match
  async createMatch(data: CreateMatchData): Promise<Match> {
    return post<Match>('/matches', data);
  },

  // Add a participant to a match
  async addParticipant(matchId: number, data: MatchParticipant): Promise<void> {
    return post(`/matches/${matchId}/participants`, data);
  },

  // Update match stats for a participant
  async updateMatchStats(matchId: number, data: MatchParticipant): Promise<void> {
    return post(`/matches/${matchId}/stats`, data);
  },

  // Update match status
  async updateMatchStatus(matchId: number, data: UpdateMatchStatusData): Promise<Match> {
    return patch<Match>(`/matches/${matchId}/status`, data);
  },

  // Delete a match
  async deleteMatch(id: number): Promise<void> {
    return del(`/matches/${id}`);
  },
};

export default matchService;
