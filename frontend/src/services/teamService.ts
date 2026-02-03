import { get, post, patch, del } from './api';

// Types for teams (matching backend entity)
export interface Team {
  id: number;
  name: string;
  sport: string;
  captain_id?: number;
  created_at?: string;
  updated_at?: string;
  // Additional fields for UI
  members?: number | TeamMember[];
  captain?: string;
  wins?: number;
  losses?: number;
  rating?: number;
}

export interface TeamMember {
  id?: number;
  user_id: number;
  role?: string;
}

export interface CreateTeamData {
  name: string;
  sport: string;
  captain_id?: number;
}

export interface UpdateTeamData {
  name?: string;
  sport?: string;
  captain_id?: number;
}

export interface JoinRequestData {
  user_id: number;
  message?: string;
}

// Team API functions
export const teamService = {
  // Get all teams
  async getTeams(): Promise<Team[]> {
    return get<Team[]>('/teams');
  },

  // Get a single team by ID
  async getTeam(id: number): Promise<Team> {
    return get<Team>(`/teams/${id}`);
  },

  // Create a new team
  async createTeam(data: CreateTeamData): Promise<Team> {
    return post<Team>('/teams', data);
  },

  // Add a member to a team
  async addMember(teamId: number, data: TeamMember): Promise<void> {
    return post(`/teams/${teamId}/members`, data);
  },

  // Remove a member from a team
  async removeMember(teamId: number, userId: number): Promise<void> {
    return del(`/teams/${teamId}/members/${userId}`);
  },

  // Update a team
  async updateTeam(teamId: number, data: UpdateTeamData): Promise<Team> {
    return patch<Team>(`/teams/${teamId}`, data);
  },

  // Delete a team
  async deleteTeam(id: number): Promise<void> {
    return del(`/teams/${id}`);
  },

  // Request to join a team
  async requestJoin(teamId: number, data: JoinRequestData): Promise<{ status: string }> {
    return post<{ status: string }>(`/teams/${teamId}/join-requests`, data);
  },

  // Accept a team invite
  async acceptInvite(inviteId: number): Promise<{ status: string }> {
    return post<{ status: string }>(`/teams/invites/${inviteId}/accept`);
  },

  // Decline a team invite
  async declineInvite(inviteId: number): Promise<{ status: string }> {
    return post<{ status: string }>(`/teams/invites/${inviteId}/decline`);
  },
};

export default teamService;
