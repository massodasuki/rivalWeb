# Design Document — Real Dashboard & Stats

## Overview

This design covers the end-to-end changes needed to replace all hardcoded/mock data in the Dashboard and Stats pages with live API data. It introduces a new `LeaderboardModule`, a new `ActivityLog` entity, query-parameter filtering on `GET /matches`, a new `GET /users/:id/activity` endpoint, and corresponding frontend service functions and component rewrites.

**Detected language:** TypeScript (dominant across both `backend/src/` and `frontend/src/`).

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (React 18 + Vite)                                     │
│                                                                 │
│  Dashboard.tsx ──► leaderboardService.getLeaderboard()          │
│                ──► userService.getUserStats(id)                 │
│                ──► userService.getUserActivity(id)              │
│                ──► useNavigate() (replaces window.prompt/alert) │
│                                                                 │
│  Stats.tsx     ──► userService.getUserStats(id)                 │
│                ──► leaderboardService.getLeaderboard()          │
│                ──► achievementService.getUserAchievements(id)   │
└─────────────────────────────────────────────────────────────────┘
                          │ HTTP (Axios via api.ts)
┌─────────────────────────────────────────────────────────────────┐
│  Backend (NestJS 10)                                            │
│                                                                 │
│  GET /leaderboard          ──► LeaderboardController            │
│                                  └─► LeaderboardService         │
│                                        ├─► RedisService (cache) │
│                                        └─► TypeORM (matches +   │
│                                              teams query)       │
│                                                                 │
│  GET /matches?participant_id=N  ──► MatchesController           │
│  GET /matches?created_by=N      ──► MatchesController           │
│                                        └─► MatchesService       │
│                                                                 │
│  GET /users/:id/activity   ──► UsersController                  │
│                                  └─► UsersService               │
│                                        └─► ActivityLog repo     │
│                                                                 │
│  POST /matches/:id/participants  ──► MatchesService             │
│                                        └─► ActivityLog insert   │
│  POST /teams/:id/members         ──► TeamsService               │
│                                        └─► ActivityLog insert   │
│  POST /achievements              ──► AchievementsService        │
│                                        └─► ActivityLog insert   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components

### Backend

#### 1. `ActivityLog` Entity

**File:** `backend/src/modules/users/entities/activity-log.entity.ts`

```typescript
@Entity('activity_log')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ length: 20 })
  type: string; // 'match_join' | 'team_join' | 'achievement'

  @Column({ length: 500 })
  message: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

The `UsersModule` registers this entity in `TypeOrmModule.forFeature([..., ActivityLog])`.

#### 2. `LeaderboardModule`

**Files:**
- `backend/src/modules/leaderboard/leaderboard.module.ts`
- `backend/src/modules/leaderboard/leaderboard.controller.ts`
- `backend/src/modules/leaderboard/leaderboard.service.ts`

The module imports `TypeOrmModule.forFeature([Match, Team])` and `RedisModule`.

**`LeaderboardService.getLeaderboard()`** logic:

```typescript
async getLeaderboard(): Promise<LeaderboardEntry[]> {
  // 1. Check Redis cache
  const cached = await this.redisService.getLeaderboard();
  if (cached) return cached;

  // 2. Query DB: count completed matches per team
  const rows = await this.matchesRepository
    .createQueryBuilder('m')
    .select('t.id', 'teamId')
    .addSelect('t.name', 'teamName')
    .addSelect('t.sport', 'sport')
    .addSelect('COUNT(m.id)', 'wins')
    .innerJoin(Team, 't', 't.id = m.home_team_id OR t.id = m.away_team_id')
    .where('m.status = :status', { status: 'completed' })
    .groupBy('t.id, t.name, t.sport')
    .having('COUNT(m.id) > 0')
    .orderBy('wins', 'DESC')
    .limit(20)
    .getRawMany();

  // 3. Map to LeaderboardEntry with rank and points
  const entries: LeaderboardEntry[] = rows.map((row, i) => ({
    rank: i + 1,
    teamId: Number(row.teamId),
    teamName: row.teamName,
    sport: row.sport,
    wins: Number(row.wins),
    points: Number(row.wins) * 3,
  }));

  // 4. Store in Redis cache
  await this.redisService.setLeaderboard(entries);
  return entries;
}
```

**`LeaderboardController`:**

```typescript
@UseGuards(JwtAuthGuard)
@Controller('leaderboard')
export class LeaderboardController {
  @Public()
  @Get()
  async getLeaderboard() {
    return this.leaderboardService.getLeaderboard();
  }
}
```

#### 3. `MatchesController` — Query Parameter Filtering

Add `@Query()` parameters to `findAll()`:

```typescript
@Public()
@Get()
async findAll(
  @Query('participant_id') participantId?: string,
  @Query('created_by') createdBy?: string,
) {
  const pid = participantId ? parseInt(participantId, 10) : undefined;
  const cid = createdBy ? parseInt(createdBy, 10) : undefined;

  if (participantId !== undefined && (isNaN(pid) || pid <= 0)) {
    throw new BadRequestException('participant_id must be a positive integer');
  }
  if (createdBy !== undefined && (isNaN(cid) || cid <= 0)) {
    throw new BadRequestException('created_by must be a positive integer');
  }

  return this.matchesService.findAll({ participantId: pid, createdBy: cid });
}
```

**`MatchesService.findAll()`** updated signature:

```typescript
async findAll(filters?: { participantId?: number; createdBy?: number }): Promise<Match[]>
```

Uses a `QueryBuilder` to apply `WHERE` clauses based on which filters are present.

#### 4. `UsersController` — Activity Endpoint

```typescript
@Get(':id/activity')
async getActivity(@Param('id') id: number) {
  return this.usersService.getActivity(id);
}
```

**`UsersService.getActivity()`:**

```typescript
async getActivity(userId: number): Promise<ActivityEntry[]> {
  const logs = await this.activityLogRepository.find({
    where: { user_id: userId },
    order: { created_at: 'DESC' },
    take: 20,
  });
  return logs.map(log => ({
    id: log.id,
    type: log.type,
    message: log.message,
    createdAt: log.created_at,
  }));
}
```

#### 5. Activity Log Insertion Points

**`MatchesService.addParticipant()`** — after saving the participant:

```typescript
await this.activityLogRepository.save({
  user_id: userId,
  type: 'match_join',
  message: `You joined match #${matchId}`,
});
```

**`TeamsService.addMember()`** — after saving the member:

```typescript
await this.activityLogRepository.save({
  user_id: userId,
  type: 'team_join',
  message: `You were added to team #${teamId}`,
});
```

**`AchievementsService.create()` and `updateValue()`** — after saving:

```typescript
await this.activityLogRepository.save({
  user_id: data.user_id,
  type: 'achievement',
  message: `Achievement unlocked: ${data.type || 'new achievement'}`,
});
```

---

### Frontend

#### 1. `leaderboardService.ts`

**File:** `frontend/src/services/leaderboardService.ts`

```typescript
import { get } from './api';

export interface LeaderboardEntry {
  rank: number;
  teamId: number;
  teamName: string;
  sport: string;
  wins: number;
  points: number;
}

export const leaderboardService = {
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return get<LeaderboardEntry[]>('/api/leaderboard');
  },
};
```

#### 2. `achievementService.ts`

**File:** `frontend/src/services/achievementService.ts`

```typescript
import { get } from './api';

export interface Achievement {
  id: number;
  user_id: number;
  type: string;
  value: number;
  updated_at: string;
}

export const achievementService = {
  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return get<Achievement[]>(`/api/achievements/user/${userId}`);
  },
};
```

#### 3. `userService.ts` — New Functions

Add to the existing `userService` object:

```typescript
async getUserActivity(id: number): Promise<ActivityEntry[]> {
  return get<ActivityEntry[]>(`/api/users/${id}/activity`);
},
```

Add the `ActivityEntry` interface:

```typescript
export interface ActivityEntry {
  id: number;
  type: 'match_join' | 'team_join' | 'achievement';
  message: string;
  createdAt: string;
}
```

#### 4. `Dashboard.tsx` — Rewrites

**State additions:**

```typescript
const navigate = useNavigate();
const [userStats, setUserStats] = useState<UserStats | null>(null);
const [statsLoading, setStatsLoading] = useState(true);
const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
const [leaderboardLoading, setLeaderboardLoading] = useState(true);
const [activityData, setActivityData] = useState<ActivityEntry[]>([]);
const [activityLoading, setActivityLoading] = useState(true);
```

**Fetch additions inside `fetchDashboardData`:**

```typescript
const [statsData, lbData, actData] = await Promise.allSettled([
  userService.getUserStats(user.id),
  leaderboardService.getLeaderboard(),
  userService.getUserActivity(user.id),
]);
if (statsData.status === 'fulfilled') setUserStats(statsData.value);
if (lbData.status === 'fulfilled') setLeaderboardData(lbData.value);
if (actData.status === 'fulfilled') setActivityData(actData.value);
```

**Stat card values** derived from `userStats`:

```typescript
const winRate = userStats && userStats.matches > 0
  ? `${((userStats.wins / userStats.matches) * 100).toFixed(1)}%`
  : '0%';
```

**Quick-action handlers** (no more `window.prompt`/`window.alert`):

```typescript
const handleCreateTeam = () => navigate('/teams');
const handleFindRival = () => navigate('/teams');
const handleQuickJoin = async () => {
  const matchId = suggestedMatches[0]?.id;
  if (!matchId || !user?.id) { navigate('/matchmaking'); return; }
  try {
    await matchService.addParticipant(matchId, { user_id: user.id, role: 'player' });
  } catch (err) {
    console.error('Error joining match:', err);
  }
  navigate('/matchmaking');
};
```

#### 5. `Stats.tsx` — Rewrites

**State additions:**

```typescript
const [userStats, setUserStats] = useState<UserStats | null>(null);
const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
const [achievementsData, setAchievementsData] = useState<Achievement[]>([]);
const [leaderboardLoading, setLeaderboardLoading] = useState(false);
const [achievementsLoading, setAchievementsLoading] = useState(false);
const [leaderboardError, setLeaderboardError] = useState(false);
const [achievementsError, setAchievementsError] = useState(false);
```

**Lazy fetch on tab change:**

```typescript
useEffect(() => {
  if (activeTab === 'leaderboard' && leaderboardData.length === 0 && !leaderboardLoading) {
    setLeaderboardLoading(true);
    leaderboardService.getLeaderboard()
      .then(setLeaderboardData)
      .catch(() => setLeaderboardError(true))
      .finally(() => setLeaderboardLoading(false));
  }
  if (activeTab === 'achievements' && achievementsData.length === 0 && !achievementsLoading && authUser?.id) {
    setAchievementsLoading(true);
    achievementService.getUserAchievements(authUser.id)
      .then(setAchievementsData)
      .catch(() => setAchievementsError(true))
      .finally(() => setAchievementsLoading(false));
  }
}, [activeTab, authUser?.id]);
```

---

## Data Models

### `LeaderboardEntry` (shared type)

| Field | Type | Description |
|---|---|---|
| `rank` | `number` | 1-based position |
| `teamId` | `number` | Team primary key |
| `teamName` | `string` | Team display name |
| `sport` | `string` | Sport type |
| `wins` | `number` | Count of completed matches |
| `points` | `number` | `wins * 3` |

### `ActivityEntry` (shared type)

| Field | Type | Description |
|---|---|---|
| `id` | `number` | ActivityLog primary key |
| `type` | `string` | `'match_join'` \| `'team_join'` \| `'achievement'` |
| `message` | `string` | Human-readable description |
| `createdAt` | `string` | ISO 8601 timestamp |

### `activity_log` table

| Column | Type | Constraints |
|---|---|---|
| `id` | `SERIAL` | PK |
| `user_id` | `INTEGER` | FK → `users.id` |
| `type` | `VARCHAR(20)` | NOT NULL |
| `message` | `VARCHAR(500)` | NOT NULL |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() |

---

## Error Handling

| Scenario | Backend behaviour | Frontend behaviour |
|---|---|---|
| Redis unavailable | `getLeaderboard()` falls through to DB query; no error thrown | Transparent to user |
| No completed matches | Returns empty array `[]` | Dashboard/Stats show empty leaderboard widget |
| `participant_id` not a positive integer | HTTP 400 `BadRequestException` | `matchService.getMatches()` rejects; caller logs error |
| `created_by` not a positive integer | HTTP 400 `BadRequestException` | Same as above |
| `GET /users/:id/activity` fails | HTTP 500 (unhandled DB error propagates) | Dashboard shows "No recent activity" row |
| `GET /users/:id/stats` fails | HTTP 500 | Dashboard/Stats show `0` for all stat values |
| `GET /achievements/user/:id` fails | HTTP 500 | Stats page shows "Could not load achievements" |
| `GET /leaderboard` fails | HTTP 500 | Dashboard/Stats show "Could not load leaderboard" |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Leaderboard win count correctness

For any set of Match records with varying statuses and team IDs, the LeaderboardService win-count computation SHALL produce a count equal to the number of records with `status = 'completed'` where the team appears as `home_team_id` or `away_team_id`.

**Validates: Requirements 1.2, 1.7**

---

### Property 2: Leaderboard sort and cap

For any non-empty set of teams with computed win counts, the returned leaderboard array SHALL be sorted by wins in descending order and SHALL contain at most 20 entries.

**Validates: Requirements 1.3**

---

### Property 3: LeaderboardEntry shape invariant

For any LeaderboardEntry in the returned array, the entry SHALL have all six required fields (`rank`, `teamId`, `teamName`, `sport`, `wins`, `points`) and `points` SHALL equal `wins * 3`.

**Validates: Requirements 1.6**

---

### Property 4: Match participant filter correctness

For any user ID `U` and any set of Match records, calling `findAll({ participantId: U })` SHALL return exactly the matches for which a `MatchParticipant` record with `user_id = U` exists — no more, no fewer.

**Validates: Requirements 2.1, 3.2**

---

### Property 5: Invalid query parameter rejection

For any string value that is not a positive integer (empty string, negative number, decimal, non-numeric), passing it as `participant_id` or `created_by` to `GET /matches` SHALL result in an HTTP 400 response.

**Validates: Requirements 2.3, 3.3**

---

### Property 6: Activity log insertion on join events

For any match join or team join operation, after the operation completes, an ActivityLog record SHALL exist in the database with the correct `user_id`, the correct `type` (`'match_join'` or `'team_join'`), and a non-empty `message`.

**Validates: Requirements 4.2, 4.3**

---

### Property 7: Activity endpoint ordering and cap

For any user with N activity log records (N ≥ 0), `GET /users/:id/activity` SHALL return `min(N, 20)` records ordered by `created_at` descending.

**Validates: Requirements 4.6**

---

### Property 8: ActivityEntry response shape

For any ActivityLog record in the database, the serialized ActivityEntry returned by `GET /users/:id/activity` SHALL contain all four required fields: `id`, `type`, `message`, and `createdAt`.

**Validates: Requirements 4.7**

---

### Property 9: Stat card values match API response

For any UserStats object `{ matches, wins, losses, goals, assists, rating }` returned by `GET /users/:id/stats`, the Dashboard stat cards SHALL display `wins`, `losses`, `goals`, and a win rate equal to `(wins / matches * 100).toFixed(1) + '%'` (or `'0%'` when `matches = 0`).

**Validates: Requirements 5.3, 8.2**

---

### Property 10: Leaderboard render completeness

For any leaderboard array returned by `leaderboardService.getLeaderboard()`, the Dashboard SHALL render at most 8 entries and the Stats page SHALL render all returned entries, each showing rank, team name, sport, wins, and points.

**Validates: Requirements 6.3, 9.2**

---

### Property 11: Achievement render completeness

For any array of Achievement objects returned by `achievementService.getUserAchievements()`, the Stats page SHALL render one card per achievement containing the `type` field as the name and the `value` field as a numeric indicator.

**Validates: Requirements 10.2**
