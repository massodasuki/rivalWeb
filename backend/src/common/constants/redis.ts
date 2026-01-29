export const REDIS_KEYS = {
  LEADERBOARD: 'leaderboard',
  UPCOMING_MATCHES: 'upcoming_matches',
  USER_STATS: 'user_stats',
  TEAM_STATS: 'team_stats',
  MATCH_RESULTS: 'match_results',
} as const;

export const CACHE_TTL = {
  LEADERBOARD: 300, // 5 minutes
  UPCOMING_MATCHES: 60, // 1 minute
  USER_STATS: 600, // 10 minutes
  TEAM_STATS: 600, // 10 minutes
  MATCH_RESULTS: 3600, // 1 hour
} as const;
