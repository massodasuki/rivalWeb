export declare const QUEUES: {
    readonly NOTIFICATIONS: "notifications";
    readonly TEAM_INVITES: "team-invites";
    readonly MATCH_INVITES: "match-invites";
    readonly LEADERBOARD_CACHE: "leaderboard-cache";
    readonly MATCH_RESULTS: "match-results";
};
export declare const EXCHANGES: {
    readonly NOTIFICATIONS: "notifications-exchange";
};
export declare const ROUTING_KEYS: {
    readonly TEAM_INVITE: "notification.team.invite";
    readonly MATCH_INVITE: "notification.match.invite";
    readonly LEADERBOARD_UPDATE: "leaderboard.update";
    readonly MATCH_COMPLETED: "match.completed";
};
