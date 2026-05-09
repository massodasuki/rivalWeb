# Requirements Document

## Introduction

This feature replaces all hardcoded and mock data in the Dashboard and Stats pages of the RivalWeb frontend with live API data. It also adds four missing backend endpoints required to serve that data: a leaderboard endpoint, two filtered match endpoints (by participant and by creator), and a user activity endpoint backed by a new `activity_log` table. Additionally, the three Dashboard quick-action buttons that currently use `window.prompt`/`window.alert` are replaced with proper navigation.

## Glossary

- **Dashboard**: The `frontend/src/pages/Dashboard.tsx` page, the main landing page after login.
- **Stats**: The `frontend/src/pages/Stats.tsx` page showing personal stats, leaderboard, and achievements.
- **LeaderboardService**: The new NestJS service at `backend/src/modules/leaderboard/leaderboard.service.ts` responsible for computing and caching leaderboard data.
- **LeaderboardController**: The new NestJS controller at `backend/src/modules/leaderboard/leaderboard.controller.ts` exposing `GET /leaderboard`.
- **ActivityLog**: The new `activity_log` database table and its corresponding TypeORM entity at `backend/src/modules/users/entities/activity-log.entity.ts`.
- **UsersController**: The existing NestJS controller at `backend/src/modules/users/users.controller.ts`.
- **MatchesController**: The existing NestJS controller at `backend/src/modules/matches/matches.controller.ts`.
- **RedisService**: The existing service at `backend/src/modules/redis/redis.service.ts` providing `setLeaderboard`, `getLeaderboard`, `updateLeaderboardEntry`, and `getTopLeaderboard`.
- **UserStats**: The shape `{ matches, wins, losses, goals, assists, rating }` returned by `GET /users/:id/stats`.
- **LeaderboardEntry**: A ranked record `{ rank, teamId, teamName, sport, wins, points }` returned by `GET /leaderboard`.
- **ActivityEntry**: A record `{ id, type, message, createdAt }` returned by `GET /users/:id/activity`.
- **useAuth**: The React hook from `frontend/src/contexts/AuthContext.tsx` that provides the authenticated user object.

---

## Requirements

### Requirement 1 — Leaderboard Backend Endpoint

**User Story:** As a player, I want to see a real leaderboard of top teams ranked by wins, so that I can track competitive standings.

#### Acceptance Criteria

1. THE LeaderboardController SHALL expose a `GET /leaderboard` route decorated with `@Public()` so unauthenticated clients can access it.
2. WHEN `GET /leaderboard` is called, THE LeaderboardService SHALL query the `matches` table and count completed matches (status = `'completed'`) per team, treating both `home_team_id` and `away_team_id` as participation.
3. WHEN `GET /leaderboard` is called, THE LeaderboardService SHALL return an array of LeaderboardEntry objects sorted by wins descending, limited to the top 20 teams.
4. WHEN `GET /leaderboard` is called and a valid cached result exists in Redis under `REDIS_KEYS.LEADERBOARD_CACHE`, THE LeaderboardService SHALL return the cached result without querying the database.
5. WHEN `GET /leaderboard` is called and no cache exists, THE LeaderboardService SHALL store the computed result in Redis using `RedisService.setLeaderboard()` before returning it.
6. THE LeaderboardEntry SHALL include the fields: `rank` (number), `teamId` (number), `teamName` (string), `sport` (string), `wins` (number), and `points` (number, computed as `wins * 3`).
7. IF a team has no completed matches, THEN THE LeaderboardService SHALL exclude that team from the leaderboard response.

---

### Requirement 2 — Matches Filter by Participant

**User Story:** As a player, I want to fetch matches I have joined, so that the "Joined Matches" tab in the Matchmaking page shows real data.

#### Acceptance Criteria

1. WHEN `GET /matches` is called with a `participant_id` query parameter, THE MatchesController SHALL return only matches where a `MatchParticipant` record exists with `user_id` equal to the provided `participant_id`.
2. WHEN `GET /matches` is called without a `participant_id` query parameter, THE MatchesController SHALL return all matches as before (existing behaviour is unchanged).
3. IF the `participant_id` query parameter is provided but is not a valid positive integer, THEN THE MatchesController SHALL return HTTP 400 with a descriptive error message.

---

### Requirement 3 — Matches Filter by Creator

**User Story:** As a player, I want to fetch matches I created, so that the "My Hosted Matches" tab shows real data.

#### Acceptance Criteria

1. WHEN `GET /matches` is called with a `created_by` query parameter, THE MatchesController SHALL return only matches where `home_team_id` belongs to a team captained by the user with the given `created_by` id.
2. WHEN `GET /matches` is called with both `participant_id` and `created_by` query parameters, THE MatchesController SHALL apply both filters (intersection).
3. IF the `created_by` query parameter is provided but is not a valid positive integer, THEN THE MatchesController SHALL return HTTP 400 with a descriptive error message.

---

### Requirement 4 — User Activity Endpoint

**User Story:** As a player, I want to see my recent activity on the Dashboard, so that I can track what I have done recently.

#### Acceptance Criteria

1. THE ActivityLog entity SHALL have the columns: `id` (primary key), `user_id` (foreign key to `users`), `type` (varchar, one of `'match_join'`, `'team_join'`, `'achievement'`), `message` (varchar, max 500 chars), and `created_at` (timestamp, auto-set on insert).
2. WHEN a user joins a match (a `MatchParticipant` record is created), THE MatchesService SHALL insert an ActivityLog record with `type = 'match_join'` and a descriptive message.
3. WHEN a user is added to a team (a `TeamMember` record is created), THE TeamsService SHALL insert an ActivityLog record with `type = 'team_join'` and a descriptive message.
4. WHEN an achievement is created or updated for a user, THE AchievementsService SHALL insert an ActivityLog record with `type = 'achievement'` and a descriptive message.
5. THE UsersController SHALL expose `GET /users/:id/activity` protected by `JwtAuthGuard`.
6. WHEN `GET /users/:id/activity` is called, THE UsersService SHALL return the 20 most recent ActivityLog records for the given user, ordered by `created_at` descending.
7. THE ActivityEntry response shape SHALL be `{ id, type, message, createdAt }`.

---

### Requirement 5 — Dashboard Stat Cards (Live Data)

**User Story:** As a player, I want the Dashboard stat cards to show my real match statistics, so that I can see accurate wins, losses, goals, and win rate.

#### Acceptance Criteria

1. WHEN the Dashboard mounts and `user.id` is available from `useAuth()`, THE Dashboard SHALL call `userService.getUserStats(user.id)` to fetch UserStats.
2. WHILE the UserStats fetch is in progress, THE Dashboard SHALL display a loading indicator in place of the stat card values.
3. WHEN UserStats are successfully fetched, THE Dashboard SHALL display `wins`, `losses`, `goals` (mapped from `goals`), and win rate (computed as `wins / matches * 100`, rounded to one decimal, suffixed with `%`) in the four stat cards.
4. IF the UserStats fetch fails, THEN THE Dashboard SHALL display `0` for all stat card values and log the error to the console.
5. THE Dashboard SHALL NOT use the hardcoded `teamStats` object for any displayed value.

---

### Requirement 6 — Dashboard Leaderboard (Live Data)

**User Story:** As a player, I want the Dashboard leaderboard widget to show real team rankings, so that I can see who is actually leading.

#### Acceptance Criteria

1. WHEN the Dashboard mounts, THE Dashboard SHALL call `GET /leaderboard` via a new `leaderboardService.getLeaderboard()` function.
2. WHILE the leaderboard fetch is in progress, THE Dashboard SHALL display a loading skeleton or spinner in the leaderboard widget.
3. WHEN the leaderboard data is successfully fetched, THE Dashboard SHALL render the top 8 entries showing rank, team name, sport, wins, and points.
4. IF the leaderboard fetch fails, THEN THE Dashboard SHALL display an empty leaderboard widget with a "Could not load leaderboard" message.
5. THE Dashboard SHALL NOT use the hardcoded `leaderboard` array constant for any displayed value.

---

### Requirement 7 — Dashboard Recent Activity (Live Data)

**User Story:** As a player, I want the Dashboard recent activity section to show my real recent actions, so that I can see what I have actually done.

#### Acceptance Criteria

1. WHEN the Dashboard mounts and `user.id` is available from `useAuth()`, THE Dashboard SHALL call `GET /users/:id/activity` via a new `userService.getUserActivity(user.id)` function.
2. WHILE the activity fetch is in progress, THE Dashboard SHALL display a loading indicator in the activity table.
3. WHEN activity data is successfully fetched, THE Dashboard SHALL render each ActivityEntry showing the message and a human-readable relative time derived from `createdAt`.
4. IF the activity fetch fails or returns an empty array, THEN THE Dashboard SHALL display a "No recent activity" row in the activity table.
5. THE Dashboard SHALL NOT use the hardcoded `recentActivity` array constant for any displayed value.

---

### Requirement 8 — Stats Page Personal Stats (Live Data)

**User Story:** As a player, I want the Stats page personal stats tab to show my real statistics, so that I can track my actual performance.

#### Acceptance Criteria

1. WHEN the Stats page mounts and `authUser.id` is available from `useAuth()`, THE Stats page SHALL call `userService.getUserStats(authUser.id)` to fetch UserStats.
2. WHEN UserStats are successfully fetched, THE Stats page SHALL display `matches`, `wins`, `goals`, and `rating` in the four stat cards on the personal stats tab.
3. IF the UserStats fetch fails, THEN THE Stats page SHALL display `0` for all stat card values.
4. THE Stats page SHALL NOT use the hardcoded `personalStats` object for any displayed value.
5. WHERE the sport filter is set to a value other than `'all'`, THE Stats page SHALL display the same fetched stats (the current `GET /users/:id/stats` endpoint returns aggregate totals; per-sport filtering is a UI-only affordance that shows the same data).

---

### Requirement 9 — Stats Page Leaderboard (Live Data)

**User Story:** As a player, I want the Stats page leaderboard tab to show real player and team rankings, so that I can see accurate standings.

#### Acceptance Criteria

1. WHEN the Stats page leaderboard tab is activated, THE Stats page SHALL call `leaderboardService.getLeaderboard()` if data has not already been fetched.
2. WHEN leaderboard data is successfully fetched, THE Stats page SHALL render all returned entries showing rank, team name, sport, wins, and points.
3. IF the leaderboard fetch fails, THEN THE Stats page SHALL display a "Could not load leaderboard" message.
4. THE Stats page SHALL NOT use the hardcoded `leaderboard` array constant for any displayed value.

---

### Requirement 10 — Stats Page Achievements (Live Data)

**User Story:** As a player, I want the Stats page achievements tab to show my real earned achievements, so that I can see what I have actually unlocked.

#### Acceptance Criteria

1. WHEN the Stats page achievements tab is activated, THE Stats page SHALL call `GET /achievements/user/:userId` via `achievementService.getUserAchievements(userId)` if data has not already been fetched.
2. WHEN achievements data is successfully fetched, THE Stats page SHALL render each achievement showing its `type` as the name, `value` as a numeric indicator, and an earned badge.
3. IF the achievements fetch returns an empty array, THEN THE Stats page SHALL display a "No achievements yet" message.
4. IF the achievements fetch fails, THEN THE Stats page SHALL display a "Could not load achievements" message.
5. THE Stats page SHALL NOT use the hardcoded `achievements` array constant for any displayed value.

---

### Requirement 11 — Remove window.prompt / window.alert from Dashboard

**User Story:** As a player, I want the Dashboard quick-action buttons to navigate properly instead of using browser dialogs, so that the experience is consistent with the rest of the app.

#### Acceptance Criteria

1. WHEN a user clicks the "Create Team" button on the Dashboard, THE Dashboard SHALL navigate to `/teams` using React Router's `useNavigate` hook instead of calling `window.prompt` or `window.alert`.
2. WHEN a user clicks the "Find Rival Team" button on the Dashboard, THE Dashboard SHALL navigate to `/teams` using React Router's `useNavigate` hook instead of calling `window.alert`.
3. WHEN a user clicks the "Quick Join" button on the Dashboard and a suggested match is available, THE Dashboard SHALL attempt to join the first suggested match and, on success or failure, navigate to `/matchmaking` instead of calling `window.alert`.
4. WHEN a user clicks the "Quick Join" button on the Dashboard and no suggested matches are available, THE Dashboard SHALL navigate to `/matchmaking` using React Router's `useNavigate` hook.
5. THE Dashboard SHALL NOT call `window.prompt` or `window.alert` anywhere in its component code.
