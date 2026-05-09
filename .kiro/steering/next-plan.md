# RivalWeb Next Plan — Steering Guide

This document covers the remaining work after the real-dashboard session. Items are ordered by impact. Work through them in order.

---

## Step 1 — Wire Matchmaking.tsx (High Impact, ~30 min)

**Status:** ⏳ Pending  
**Why:** The backend filters are already built. This is purely a frontend wiring job.

### 1.1 "Joined Matches" Tab

**File:** `frontend/src/pages/Matchmaking.tsx`

Replace the static "No joined matches yet" message with a real API call:

```ts
// On tab activation or mount, fetch matches the user has joined
const joinedMatches = await matchService.getMatches({ participant_id: String(user.id) });
```

- Use `useAuth()` to get `user.id` — never `localStorage.getItem('userId')`
- Show a loading state while fetching
- Show "No joined matches yet" only when the array is empty after a successful fetch

### 1.2 "My Hosted Matches" Tab

Replace the hardcoded `hostedMatches` array:

```ts
// Fetch matches where the user captains the home team
const hostedMatches = await matchService.getMatches({ created_by: String(user.id) });
```

### 1.3 Replace window.prompt / window.alert

`Matchmaking.tsx` and `Teams.tsx` still use browser dialogs. Replace with the existing modal components:
- Use `CreateMatchModal` (already exists) for creating matches
- Use `CreateTeamModal` (already exists) for creating teams
- For any remaining `window.alert` calls, replace with inline error/success state in the UI

---

## Step 2 — Implement Workers (High Impact)

**Status:** ⏳ Pending  
**Files:** `backend/src/workers/`

All three workers are stubs with `// TODO` comments. They consume RabbitMQ queues but do nothing.

### 2.1 `achievements.worker.ts`

This is the most important worker — it's what makes achievements actually unlock.

Logic:
1. Consume the achievements queue
2. For the given `user_id`, call `UsersService.getStats(userId)` to get current totals
3. Check thresholds and call `AchievementsService.updateValue()` for each unlocked achievement:

```ts
// Example thresholds
if (stats.wins >= 1)   achievementsService.updateValue(userId, 'wins', stats.wins);
if (stats.goals >= 3)  achievementsService.updateValue(userId, 'goals', stats.goals);
if (stats.matches >= 5) achievementsService.updateValue(userId, 'matches', stats.matches);
```

Queue name constant is in `backend/src/common/constants/queues.ts`.

### 2.2 `match-results.worker.ts`

Logic:
1. Consume the match results queue
2. Write result data to the DB via `MatchesService.updateStatus(matchId, 'completed')`
3. Invalidate the leaderboard Redis cache: `redisService.invalidateLeaderboard()`
4. Publish to the achievements queue so `achievements.worker.ts` runs for each participant

### 2.3 `notifications.worker.ts`

Logic:
1. Consume the notifications queue
2. Send email via Nodemailer (SMTP) or SendGrid
3. Use env vars for credentials — never hardcode

Suggested env vars to add to `.env`:
```
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@rival.app
```

---

## Step 3 — Pagination on List Endpoints (Medium Impact)

**Status:** ⏳ Pending

### Backend

Add `limit` and `offset` query params to these controllers:
- `GET /matches` — already uses QueryBuilder, easy to add `.take(limit).skip(offset)`
- `GET /teams` — uses `find()`, add `{ take: limit, skip: offset }`
- `GET /users` — same pattern
- `GET /community/posts` — same pattern

Default: `limit=20`, `offset=0`. Validate that `limit` is between 1 and 100.

Return shape:
```ts
{
  data: T[],
  total: number,
  limit: number,
  offset: number,
}
```

### Frontend

Update `matchService.getMatches()`, `teamService.getTeams()`, etc. to accept and pass `limit`/`offset` params. Add "Load More" buttons or infinite scroll where appropriate.

---

## Step 4 — TypeORM Migration for `activity_log` (Medium Impact)

**Status:** ⏳ Pending  
**Why:** `DB_SYNC=true` creates the table in local dev but must never be used in staging/prod.

Generate a migration:
```bash
cd backend
npx typeorm migration:generate src/migrations/CreateActivityLog -d src/data-source.ts
```

The migration should create the `activity_log` table with:
- `id` SERIAL PRIMARY KEY
- `user_id` INTEGER NOT NULL REFERENCES users(id)
- `type` VARCHAR(20) NOT NULL
- `message` VARCHAR(500) NOT NULL
- `created_at` TIMESTAMP DEFAULT NOW()

Add an index on `(user_id, created_at DESC)` for the activity feed query performance.

---

## Step 5 — socket-io-redis Adapter (Low Impact)

**Status:** ⏳ Pending  
**Only needed for multi-instance deployments.**

**Option A (single instance — remove the confusion):**
Remove `socket.io-redis` from `backend/package.json` dependencies since it's imported but never configured.

**Option B (multi-instance — configure it properly):**

In `backend/src/modules/socket/socket.gateway.ts`:

```ts
import { createAdapter } from '@socket.io/redis-adapter';

afterInit(server: Server) {
  const pubClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  });
  const subClient = pubClient.duplicate();
  server.adapter(createAdapter(pubClient, subClient));
}
```

Note: use `@socket.io/redis-adapter` (the modern package), not the old `socket.io-redis`.

---

## Checklist

| # | Area | Task | Priority | Status |
|---|------|------|----------|--------|
| 1.1 | Frontend | Wire "Joined Matches" tab in Matchmaking.tsx | 🔴 High | ⏳ Pending |
| 1.2 | Frontend | Wire "My Hosted Matches" tab in Matchmaking.tsx | 🔴 High | ⏳ Pending |
| 1.3 | Frontend | Replace window.prompt/alert in Matchmaking.tsx + Teams.tsx | 🔴 High | ⏳ Pending |
| 2.1 | Backend | Implement achievements.worker.ts | 🔴 High | ⏳ Pending |
| 2.2 | Backend | Implement match-results.worker.ts | 🔴 High | ⏳ Pending |
| 2.3 | Backend | Implement notifications.worker.ts | 🟠 Medium | ⏳ Pending |
| 3.1 | Backend | Add pagination to GET /matches, /teams, /users, /community/posts | 🟠 Medium | ⏳ Pending |
| 3.2 | Frontend | Wire pagination params in service calls + Load More UI | 🟠 Medium | ⏳ Pending |
| 4.1 | Backend | Write TypeORM migration for activity_log table | 🟠 Medium | ⏳ Pending |
| 5.1 | Backend | Remove or configure socket-io-redis adapter | 🟡 Low | ⏳ Pending |
