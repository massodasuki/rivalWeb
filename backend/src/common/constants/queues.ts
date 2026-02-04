export const QUEUES = {
  NOTIFICATIONS: 'notifications',
  TEAM_INVITES: 'team-invites',
  MATCH_INVITES: 'match-invites',
  LEADERBOARD_CACHE: 'leaderboard-cache',
  MATCH_RESULTS: 'match-results',
} as const;

export const EXCHANGES = {
  NOTIFICATIONS: 'notifications-exchange',
} as const;

export const ROUTING_KEYS = {
  TEAM_INVITE: 'notification.team.invite',
  MATCH_INVITE: 'notification.match.invite',
  LEADERBOARD_UPDATE: 'leaderboard.update',
  MATCH_COMPLETED: 'match.completed',
} as const;
