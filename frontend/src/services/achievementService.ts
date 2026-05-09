import { get } from './api';

export interface Achievement {
  id: number;
  user_id: number;
  type: string;
  value: number;
  updated_at?: string;
}

export const achievementService = {
  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return get<Achievement[]>(`/api/achievements/user/${userId}`);
  },
};
