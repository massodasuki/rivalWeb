"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROUTING_KEYS = exports.EXCHANGES = exports.QUEUES = void 0;
exports.QUEUES = {
    NOTIFICATIONS: 'notifications',
    TEAM_INVITES: 'team-invites',
    MATCH_INVITES: 'match-invites',
    LEADERBOARD_CACHE: 'leaderboard-cache',
    MATCH_RESULTS: 'match-results',
};
exports.EXCHANGES = {
    NOTIFICATIONS: 'notifications-exchange',
};
exports.ROUTING_KEYS = {
    TEAM_INVITE: 'notification.team.invite',
    MATCH_INVITE: 'notification.match.invite',
    LEADERBOARD_UPDATE: 'leaderboard.update',
    MATCH_COMPLETED: 'match.completed',
};
//# sourceMappingURL=queues.js.map