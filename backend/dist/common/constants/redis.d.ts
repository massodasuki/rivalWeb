export declare const REDIS_KEYS: {
    readonly LEADERBOARD: "leaderboard";
    readonly UPCOMING_MATCHES: "upcoming_matches";
    readonly USER_STATS: "user_stats";
    readonly TEAM_STATS: "team_stats";
    readonly MATCH_RESULTS: "match_results";
};
export declare const CACHE_TTL: {
    readonly LEADERBOARD: 300;
    readonly UPCOMING_MATCHES: 60;
    readonly USER_STATS: 600;
    readonly TEAM_STATS: 600;
    readonly MATCH_RESULTS: 3600;
};
