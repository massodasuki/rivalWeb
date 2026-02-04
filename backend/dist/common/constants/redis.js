"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_TTL = exports.REDIS_KEYS = void 0;
exports.REDIS_KEYS = {
    LEADERBOARD: 'leaderboard',
    UPCOMING_MATCHES: 'upcoming_matches',
    USER_STATS: 'user_stats',
    TEAM_STATS: 'team_stats',
    MATCH_RESULTS: 'match_results',
};
exports.CACHE_TTL = {
    LEADERBOARD: 300,
    UPCOMING_MATCHES: 60,
    USER_STATS: 600,
    TEAM_STATS: 600,
    MATCH_RESULTS: 3600,
};
//# sourceMappingURL=redis.js.map