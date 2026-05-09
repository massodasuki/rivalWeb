# Implementation Plan: Real Dashboard & Stats

## Overview

Replace all hardcoded/mock data in the Dashboard and Stats pages with live API data. This requires four new/extended backend endpoints, a new `activity_log` table, a new `LeaderboardModule`, and frontend service + component rewrites. Tasks are ordered so each step builds on the previous one.

## Tasks

- [x] 1. Create the `ActivityLog` entity and register it in `UsersModule`
  - Create `backend/src/modules/users/entities/activity-log.entity.ts` with columns: `id`, `user_id` (FK → users), `type` (varchar 20), `message` (varchar 500), `created_at` (auto timestamp)
  - Add `ActivityLog` to `TypeOrmModule.forFeature([..., ActivityLog])` in `backend/src/modules/users/users.module.ts`
  - Export `ActivityLog` from the users module so other modules can inject its repository
  - _Requirements: 4.1_

- [x] 2. Add `GET /users/:id/activity` endpoint
  - Inject `ActivityLog` repository into `UsersService`
  - Implement `UsersService.getActivity(userId: number)`: query the 20 most recent `ActivityLog` records for the user ordered by `created_at DESC`, map to `{ id, type, message, createdAt }`
  - Add `@Get(':id/activity')` route to `UsersController` (protected by `JwtAuthGuard`, placed before `@Get(':id')` to respect static-before-parameterised rule)
  - _Requirements: 4.5, 4.6, 4.7_

  - [ ]* 2.1 Write property test for activity ordering and cap
    - **Property 7: Activity endpoint ordering and cap**
    - **Validates: Requirements 4.6**

  - [ ]* 2.2 Write property test for ActivityEntry response shape
    - **Property 8: ActivityEntry response shape**
    - **Validates: Requirements 4.7**

- [x] 3. Wire activity log insertion into `MatchesService`, `TeamsService`, and `AchievementsService`
  - Import `ActivityLog` repository into `MatchesService` (add to `MatchesModule` imports and inject)
  - After `participantsRepository.save(participant)` in `MatchesService.addParticipant()`, insert an `ActivityLog` record with `type = 'match_join'` and message `You joined match #${matchId}`
  - Import `ActivityLog` repository into `TeamsService` (add to `TeamsModule` imports and inject)
  - After `teamMembersRepository.save(member)` in `TeamsService.addMember()`, insert an `ActivityLog` record with `type = 'team_join'` and message `You were added to team #${teamId}`
  - Import `ActivityLog` repository into `AchievementsService` (add to `AchievementsModule` imports and inject)
  - After saving in `AchievementsService.create()` and `updateValue()`, insert an `ActivityLog` record with `type = 'achievement'` and message `Achievement unlocked: ${type}`
  - _Requirements: 4.2, 4.3, 4.4_

  - [ ]* 3.1 Write property test for activity log insertion on join events
    - **Property 6: Activity log insertion on join events**
    - **Validates: Requirements 4.2, 4.3**

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create the `LeaderboardModule` with service and controller
  - Create `backend/src/modules/leaderboard/leaderboard.module.ts` importing `TypeOrmModule.forFeature([Match, Team])` and `RedisModule`
  - Create `backend/src/modules/leaderboard/leaderboard.service.ts` with `getLeaderboard()`: check `RedisService.getLeaderboard()` first; on cache miss, run a `QueryBuilder` joining `matches` and `teams` to count completed matches per team (both `home_team_id` and `away_team_id`), filter out teams with 0 wins, sort descending, limit 20, map to `LeaderboardEntry` with `rank`, `teamId`, `teamName`, `sport`, `wins`, `points = wins * 3`; store result via `RedisService.setLeaderboard()` before returning
  - Create `backend/src/modules/leaderboard/leaderboard.controller.ts` with `@UseGuards(JwtAuthGuard)` at class level and `@Public() @Get()` on `getLeaderboard()`
  - Register `LeaderboardModule` in `AppModule`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ]* 5.1 Write property test for leaderboard win count correctness
    - **Property 1: Leaderboard win count correctness**
    - **Validates: Requirements 1.2, 1.7**

  - [ ]* 5.2 Write property test for leaderboard sort and cap
    - **Property 2: Leaderboard sort and cap**
    - **Validates: Requirements 1.3**

  - [ ]* 5.3 Write property test for LeaderboardEntry shape invariant
    - **Property 3: LeaderboardEntry shape invariant**
    - **Validates: Requirements 1.6**

- [x] 6. Add query-parameter filtering to `GET /matches`
  - Add `@Query('participant_id')` and `@Query('created_by')` parameters to `MatchesController.findAll()`
  - Validate each: if provided and not a positive integer, throw `BadRequestException`
  - Update `MatchesService.findAll()` to accept `filters?: { participantId?: number; createdBy?: number }` and apply `QueryBuilder` `WHERE` clauses accordingly:
    - `participant_id`: inner join `match_participants` on `user_id = :participantId`
    - `created_by`: inner join `teams` on `home_team_id = teams.id AND teams.captain_id = :createdBy`
    - Both filters applied together produce the intersection
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

  - [ ]* 6.1 Write property test for match participant filter correctness
    - **Property 4: Match participant filter correctness**
    - **Validates: Requirements 2.1, 3.2**

  - [ ]* 6.2 Write property test for invalid query parameter rejection
    - **Property 5: Invalid query parameter rejection**
    - **Validates: Requirements 2.3, 3.3**

- [x] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Create frontend `leaderboardService.ts` and `achievementService.ts`
  - Create `frontend/src/services/leaderboardService.ts` exporting `LeaderboardEntry` interface and `leaderboardService.getLeaderboard()` calling `GET /api/leaderboard`
  - Create `frontend/src/services/achievementService.ts` exporting `Achievement` interface and `achievementService.getUserAchievements(userId)` calling `GET /api/achievements/user/:userId`
  - Add `ActivityEntry` interface and `userService.getUserActivity(id)` function to `frontend/src/services/userService.ts` calling `GET /api/users/:id/activity`
  - _Requirements: 6.1, 7.1, 9.1, 10.1_

- [x] 9. Rewrite `Dashboard.tsx` — stat cards, leaderboard, activity, and quick-action buttons
  - Add `useNavigate` import from `react-router-dom`
  - Add state: `userStats`, `statsLoading`, `leaderboardData`, `leaderboardLoading`, `activityData`, `activityLoading`
  - Inside `fetchDashboardData`, add `Promise.allSettled` calls for `userService.getUserStats(user.id)`, `leaderboardService.getLeaderboard()`, and `userService.getUserActivity(user.id)`; update state from settled results
  - Replace stat card values: use `userStats.wins`, `userStats.losses`, `userStats.goals`, and computed win rate (`userStats.matches > 0 ? (wins/matches*100).toFixed(1)+'%' : '0%'`); show `0` on null/error
  - Replace leaderboard render: map `leaderboardData.slice(0, 8)` instead of the hardcoded `leaderboard` array; show loading spinner while `leaderboardLoading`; show "Could not load leaderboard" on error
  - Replace recent activity render: map `activityData` instead of the hardcoded `recentActivity` array; show loading indicator while `activityLoading`; show "No recent activity" row when empty or on error; derive relative time from `createdAt` using a simple helper
  - Replace `handleCreateTeam` with `() => navigate('/teams')`
  - Replace `handleFindRival` with `() => navigate('/teams')`
  - Replace `handleQuickJoin` with: attempt join on first suggested match, then `navigate('/matchmaking')` regardless of outcome
  - Remove the hardcoded `teamStats`, `leaderboard`, and `recentActivity` constants entirely
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 9.1 Write property test for stat card values matching API response
    - **Property 9: Stat card values match API response**
    - **Validates: Requirements 5.3**

  - [ ]* 9.2 Write property test for leaderboard render completeness (Dashboard)
    - **Property 10: Leaderboard render completeness**
    - **Validates: Requirements 6.3**

- [x] 10. Rewrite `Stats.tsx` — personal stats, leaderboard, and achievements
  - Add state: `userStats`, `statsLoading`, `leaderboardData`, `leaderboardLoading`, `leaderboardError`, `achievementsData`, `achievementsLoading`, `achievementsError`
  - In the existing `useEffect` (on `authUser?.id`), call `userService.getUserStats(authUser.id)` and store in `userStats`; show `0` on error
  - Replace personal stats tab stat card values: use `userStats.matches`, `userStats.wins`, `userStats.goals`, `userStats.rating`; show `0` on null/error
  - Add a second `useEffect` on `activeTab` for lazy fetching: when tab switches to `'leaderboard'` and data not yet loaded, call `leaderboardService.getLeaderboard()`; when tab switches to `'achievements'` and data not yet loaded, call `achievementService.getUserAchievements(authUser.id)`
  - Replace leaderboard tab render: map `leaderboardData` instead of the hardcoded `leaderboard` array; show loading state; show "Could not load leaderboard" on error
  - Replace achievements tab render: map `achievementsData` instead of the hardcoded `achievements` array; show "No achievements yet" when empty; show "Could not load achievements" on error
  - Remove the hardcoded `personalStats`, `leaderboard`, and `achievements` constants entirely
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 10.1 Write property test for stat card values matching API response (Stats page)
    - **Property 9: Stat card values match API response**
    - **Validates: Requirements 8.2**

  - [ ]* 10.2 Write property test for leaderboard render completeness (Stats page)
    - **Property 10: Leaderboard render completeness**
    - **Validates: Requirements 9.2**

  - [ ]* 10.3 Write property test for achievement render completeness
    - **Property 11: Achievement render completeness**
    - **Validates: Requirements 10.2**

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The `ActivityLog` entity uses `DB_SYNC=true` in local dev to auto-create the table; use a migration for staging/prod
- The leaderboard Redis cache TTL is 5 minutes (`CACHE_TTL.LEADERBOARD = 300`), defined in `backend/src/common/constants/redis.ts`
- Static routes (`GET /users/:id/activity`) must be declared before parameterised routes (`GET /users/:id`) in `UsersController` — already enforced by the project's route ordering rule
- Property tests validate universal correctness properties; unit tests validate specific examples and edge cases
