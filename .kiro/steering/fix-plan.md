# RivalWeb Fix Plan — Steering Guide

This document is the authoritative fix plan for the RivalWeb project. It covers every confirmed bug, security hole, broken feature, and missing implementation found across the backend (NestJS) and frontend (React/Vite). Work through the priorities in order.

---

## Priority 1 — Critical Bugs (Break the App)

### 1.1 Duplicate `User` Entity on the Same DB Table

**Problem:** Two separate `User` entity classes both map to the `users` table:
- `backend/src/modules/auth/entities/user.entity.ts`
- `backend/src/modules/users/entities/user.entity.ts`

The `auth` entity has all the ORM relations (Friendship, Team, etc.) but is missing `avatar`, `phone`, `primary_sport`, `updated_at`. The `users` entity has those fields but no relations. TypeORM will pick one arbitrarily, causing missing columns or broken relations at runtime.

**Fix:**
1. Delete `backend/src/modules/auth/entities/user.entity.ts`.
2. Move all ORM relations from the deleted file into `backend/src/modules/users/entities/user.entity.ts`.
3. Update every import of `User` from the auth path to import from `../../users/entities/user.entity`.
4. Update `AuthModule` to use `TypeOrmModule.forFeature([User])` from the users entity.
5. Update `AuthService` to import `User` from the correct path.

---

### 1.2 `socketService.getSocket()` Disconnects on Every Call

**Problem:** `frontend/src/services/socketService.ts` — `getSocket()` always disconnects the existing socket and creates a new one, even when called from multiple hooks. Every hook that calls `getSocket()` kills the previous connection, so only the last caller has a live socket.

**Fix:**
- Change `getSocket()` to return the existing socket if it is already connected and the token has not changed.
- Only create a new socket when there is no existing connection or the token changed.
- Example pattern:
  ```ts
  export const getSocket = (token?: string): Socket => {
    const resolvedToken = token || localStorage.getItem('authToken');
    if (socket && socket.connected) return socket;
    if (socket) { socket.disconnect(); socket = null; }
    // ... create new socket
  };
  ```

---

### 1.3 `useSocket` Cleanup Logic Is Inverted

**Problem:** `frontend/src/hooks/useSocket.ts` — the cleanup effect disconnects the socket only when `!socket.connected`, which is the opposite of what is needed. It should disconnect when the component unmounts regardless of connection state.

**Fix:**
```ts
// Cleanup on unmount
useEffect(() => {
  return () => {
    disconnectSocket();
  };
}, []);
```
Remove the `if (!socketRef.current.connected)` guard entirely.

---

### 1.4 RabbitMQ Channel Is `undefined` After Failed Connect

**Problem:** `backend/src/modules/rabbitmq/rabbitmq.service.ts` — if `connect()` throws, `this.channel` is never assigned. `publishToQueue` and `publishWithRoutingKey` then call `this.channel.sendToQueue(...)` on `undefined`, crashing the process.

**Fix:**
- Add a null-check guard in `publishToQueue` and `publishWithRoutingKey`:
  ```ts
  if (!this.channel) {
    this.logger.warn('RabbitMQ channel not available, skipping publish');
    return;
  }
  ```
- Also add reconnect logic or a health-check so the service recovers after RabbitMQ restarts.

---

### 1.5 Redis Key Type Conflict (SETEX vs ZADD on Same Key)

**Problem:** `backend/src/modules/redis/redis.service.ts` — `setLeaderboard()` stores the leaderboard as a JSON string with `SETEX`, but `updateLeaderboardEntry()` uses `ZADD` on the same key (`REDIS_KEYS.LEADERBOARD`). Redis will throw a `WRONGTYPE` error because a string key cannot be used as a sorted set.

**Fix:**
- Use two separate keys: one for the cached JSON blob (`leaderboard:cache`) and one for the sorted set (`leaderboard:scores`).
- Update `getLeaderboard()` and `getTopLeaderboard()` to read from the correct key type.

---

### 1.6 Broken Route Ordering in `TeamsController`

**Problem:** `backend/src/modules/teams/teams.controller.ts` — the route `GET /teams/user/invitations` is defined **after** `GET /teams/:id`. NestJS/Express will match `/user/invitations` as `id = "user"` and call `findOne("user")`, which will fail with a DB error.

**Fix:**
Move `GET user/invitations` **before** `GET :id`:
```ts
@Get('user/invitations')
@UseGuards(JwtAuthGuard)
async getUserInvitations(@Req() req: Request) { ... }

@Get(':id')
async findOne(@Param('id') id: number) { ... }
```
Same applies to any other static sub-routes that come after parameterized routes.

---

## Priority 2 — Security Issues

### 2.1 No Authentication on Most Controllers

**Problem:** The following controllers have zero `@UseGuards(JwtAuthGuard)` protection, meaning any unauthenticated request can read or mutate data:
- `UsersController` — all endpoints including `DELETE /users/:id` and `POST /users/:id/password`
- `MatchesController` — all endpoints
- `CommunityController` — all endpoints
- `ChatController` — all endpoints
- `NotificationsController` — all endpoints
- `AchievementsController` — all endpoints
- `FriendshipsController` — all endpoints

**Fix:**
Add `@UseGuards(JwtAuthGuard)` at the controller class level for all of the above. For endpoints that should be public (e.g., `GET /matches` for browsing), use a custom `@Public()` decorator to opt out.

---

### 2.2 `password_hash` Exposed in API Responses

**Problem:** `AuthService.register()` and `AuthService.login()` return the full `User` entity including `password_hash`. The field is sent to the client in the JSON response.

**Fix:**
- Add `@Exclude()` from `class-transformer` to the `password_hash` column in the User entity.
- Enable `ClassSerializerInterceptor` globally in `main.ts`:
  ```ts
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  ```
- Or manually strip the field before returning: `const { password_hash, ...safeUser } = user;`

---

### 2.3 `updatePassword` Does Not Verify Current Password

**Problem:** `backend/src/modules/users/users.service.ts` — `updatePassword()` accepts `current_password` in the DTO but never checks it against the stored hash. Anyone who can call the endpoint can change any user's password without knowing the old one.

**Fix:**
```ts
async updatePassword(id: number, data: { current_password?: string; new_password: string }) {
  const user = await this.findOne(id);
  if (!data.current_password || !(await bcrypt.compare(data.current_password, user.password_hash))) {
    throw new UnauthorizedException('Current password is incorrect');
  }
  const password_hash = await bcrypt.hash(data.new_password, 10);
  await this.usersRepository.update(id, { password_hash });
  return { status: 'password_updated' };
}
```

---

### 2.4 JWT Fallback Secret Is a Well-Known String

**Problem:** `AuthModule` (or `JwtModule.register`) likely falls back to a hardcoded secret like `'secret'` or `'your-secret-key'` when `JWT_SECRET` env var is missing.

**Fix:**
- Throw at startup if `JWT_SECRET` is not set:
  ```ts
  JwtModule.registerAsync({
    useFactory: (config: ConfigService) => {
      const secret = config.get<string>('JWT_SECRET');
      if (!secret) throw new Error('JWT_SECRET env var is required');
      return { secret, signOptions: { expiresIn: '7d' } };
    },
    inject: [ConfigService],
  })
  ```

---

### 2.5 No Rate Limiting on Auth Endpoints

**Problem:** `/auth/login` and `/auth/register` have no rate limiting, making them vulnerable to brute-force attacks.

**Fix:**
Install `@nestjs/throttler` and apply a throttle guard to the auth controller:
```ts
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Controller('auth')
export class AuthController { ... }
```

---

## Priority 3 — Frontend Bugs

### 3.1 Hardcoded `user_id: 1` in Dashboard Join Match

**Problem:** `frontend/src/pages/Dashboard.tsx` — `handleJoinMatch()` hardcodes `user_id: 1` instead of reading from auth:
```ts
await matchService.addParticipant(matchId, { user_id: 1, role: 'player' });
```

**Fix:**
```ts
const userId = authService.getUserId();
if (!userId) return;
await matchService.addParticipant(matchId, { user_id: userId, role: 'player' });
```

---

### 3.2 Mock User "Alex Johnson" Always Shown in Dashboard

**Problem:** `frontend/src/pages/Dashboard.tsx` — `mockUser` is hardcoded. The welcome message always says "Welcome back, Alex Johnson!" regardless of who is logged in.

**Fix:**
- Create an `AuthContext` (or use a simple hook) that stores the current user from `authService.getCurrentUser()`.
- Replace `mockUser.name` with the real user's name from context/state.

---

### 3.3 Stats Page `fetchUserData` Is Never Called

**Problem:** `frontend/src/pages/Stats.tsx` — `fetchUserData` is defined but never called (no `useEffect` invokes it). The stats page always shows hardcoded mock data.

**Fix:**
Add a `useEffect` to call it on mount:
```ts
useEffect(() => {
  fetchUserData();
}, []);
```
Then wire the fetched `user` data into the stats display.

---

### 3.4 `TeamMember.user.username` Does Not Exist

**Problem:** `frontend/src/services/teamService.ts` — `TeamMember.user` is typed with `username?: string`, but the backend `User` entity has `name`, not `username`. Any UI that renders `member.user.username` will show `undefined`.

**Fix:**
Change the `TeamMember` type:
```ts
user?: {
  id: number;
  name: string;   // was: username
  email?: string;
};
```
Update all UI references from `.username` to `.name`.

---

### 3.5 "Joined Matches" Tab Is Always Empty

**Problem:** `frontend/src/pages/Matchmaking.tsx` — the "Joined Matches" tab always renders a static "No joined matches yet" message. There is no API call to fetch matches the current user has joined.

**Fix:**
- Add a backend endpoint: `GET /matches?participant_id=:userId` or `GET /users/:id/matches`.
- In the frontend, fetch and display the user's joined matches when the "Joined Matches" tab is active.

---

### 3.6 "My Hosted Matches" Tab Uses Hardcoded Mock Data

**Problem:** `frontend/src/pages/Matchmaking.tsx` — `hostedMatches` is a hardcoded array. It never reflects real data.

**Fix:**
- Add a backend endpoint: `GET /matches?created_by=:userId` or filter by `home_team_id` belonging to the user.
- Fetch and display real hosted matches.

---

### 3.7 No Global Auth Context

**Problem:** Multiple pages independently read `localStorage.getItem('userId')` and call `authService.getCurrentUser()`. There is no shared auth state, so user data is fetched redundantly and changes (like logout) don't propagate reactively.

**Fix:**
Create `frontend/src/contexts/AuthContext.tsx`:
```tsx
export const AuthContext = createContext<{ user: AuthUser | null; loading: boolean; logout: () => void }>(...)

export function AuthProvider({ children }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  // fetch on mount, expose via context
}
```
Wrap `<App>` with `<AuthProvider>` in `main.tsx`. Replace all `localStorage.getItem('userId')` calls with `useAuth()`.

---

### 3.8 Settings Page Loads with Hardcoded Placeholder Data

**Problem:** `frontend/src/pages/Settings.tsx` — `userData` is initialized with `'John Doe'` / `'john.doe@example.com'`. `fetchUserData` is called in `useEffect` but if it fails (e.g., network error), the hardcoded values remain and the user sees fake data.

**Fix:**
- Initialize `userData` with empty strings, not fake names.
- Show a loading skeleton until the API call resolves.
- Display a proper error state if the fetch fails.

---

## Priority 4 — Missing / Stub Implementations

### 4.1 Workers Are TODO Stubs

**Problem:** `backend/src/workers/` — all worker handlers contain `// TODO` comments and do nothing. Email sending, DB writes for match results, and achievement unlocking are all no-ops.

**Fix (implement each):**
- `notifications.worker.ts` — integrate a mail provider (e.g., Nodemailer or SendGrid) to send emails.
- `match-results.worker.ts` — write match result data to the DB and trigger leaderboard recalculation.
- `achievements.worker.ts` — query user stats and unlock achievements based on thresholds.

---

### 4.2 No Leaderboard HTTP Endpoint

**Problem:** The leaderboard data shown in Dashboard and Stats is entirely hardcoded mock data. There is no `GET /leaderboard` or `GET /stats/leaderboard` endpoint.

**Fix:**
- Add `GET /leaderboard` to a new `LeaderboardController` (or extend `StatsController`).
- The service should query team wins from the DB (or read from Redis sorted set after fixing issue 1.5).
- Wire the frontend Dashboard and Stats pages to call this endpoint.

---

### 4.3 `socket-io-redis` Imported but Not Configured

**Problem:** `socket.io-redis` is in `package.json` but the `SocketGateway` never calls `server.adapter(createAdapter(...))`. The socket server runs in-memory only, meaning it won't work across multiple backend instances.

**Fix (for single-instance dev):** Remove the unused dependency to avoid confusion.
**Fix (for multi-instance prod):** Configure the adapter:
```ts
import { createAdapter } from 'socket.io-redis';
afterInit(server: Server) {
  const pubClient = new Redis({ host, port });
  const subClient = pubClient.duplicate();
  server.adapter(createAdapter(pubClient, subClient));
}
```

---

### 4.4 `ioredis` Listed in Both `dependencies` and `devDependencies`

**Problem:** `backend/package.json` has `ioredis` in both sections. The `devDependencies` version will be ignored at runtime but causes confusion and potential version conflicts.

**Fix:**
Remove `ioredis` from `devDependencies`, keep it only in `dependencies`.

---

### 4.5 `RESPOND_MATCH_INVITATION` and `RESPOND_TEAM_INVITATION` Broadcast to All Clients

**Problem:** `backend/src/modules/socket/socket.gateway.ts` — both respond handlers use `this.server.emit(...)` (broadcast to everyone) instead of `this.server.to('user_<inviterId>').emit(...)`.

**Fix:**
```ts
// In handleRespondMatchInvitation — notify the original inviter only
this.server.to(`user_${data.inviterId}`).emit(SOCKET_EVENTS.MATCH_INVITATION_UPDATED, { ... });

// In handleRespondTeamInvitation — notify the original inviter only
this.server.to(`user_${data.inviterId}`).emit(SOCKET_EVENTS.TEAM_INVITATION_UPDATED, { ... });
```
The `inviterId` must be included in the `RespondMatchInvitationDto` / `RespondTeamInvitationDto`.

---

### 4.6 `ChatGateway` Is Dead Code Conflicting with `SocketGateway`

**Problem:** `backend/src/modules/chat/chat.gateway.ts` exists alongside `SocketGateway`. Both handle chat events. `ChatGateway` is likely unused but still registered, causing duplicate event handlers and potential namespace conflicts.

**Fix:**
- Audit which gateway is actually used.
- Remove `ChatGateway` if `SocketGateway` handles all chat events.
- Remove `ChatGateway` from `ChatModule` providers.

---

## Priority 5 — Code Quality & Architecture

### 5.1 `synchronize: true` Risk

**Problem:** `app.module.ts` uses `synchronize: process.env.NODE_ENV !== 'production'`. In staging or CI environments where `NODE_ENV` is not set, this will auto-migrate the schema and can cause data loss.

**Fix:**
- Default `synchronize` to `false`.
- Use TypeORM migrations for all schema changes.
- Only enable `synchronize: true` explicitly in local dev via an env var: `synchronize: process.env.DB_SYNC === 'true'`.

---

### 5.2 No Pagination on List Endpoints

**Problem:** `GET /matches`, `GET /teams`, `GET /users`, `GET /community/posts` return all rows with no limit. This will cause performance issues as data grows.

**Fix:**
Add `limit` and `offset` (or `page` / `pageSize`) query params to all list endpoints. Default to `limit=20`.

---

### 5.3 `window.prompt` / `window.alert` Used for UX

**Problem:** Multiple frontend pages (`Dashboard.tsx`, `Matchmaking.tsx`, `Teams.tsx`) use `window.prompt()` and `window.alert()` for user interaction. These are blocking, unstyled, and inaccessible.

**Fix:**
Replace with proper modal components (the project already has `CreateMatchModal` and `CreateTeamModal` as examples to follow).

---

### 5.4 `ProtectedRoute` and `GuestRoute` Re-Check Auth on Every Render

**Problem:** `frontend/src/App.tsx` — both route wrappers call `authService.isAuthenticated()` in `useState` initializer AND in a `useEffect`. The `useEffect` runs after render, causing a flash of the loading state on every navigation.

**Fix:**
Remove the `useEffect` and the `loading` state. `authService.isAuthenticated()` is a synchronous localStorage check — it's safe to call directly in the render:
```tsx
function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

---

## Checklist Summary

| # | Area | Issue | Priority | Status |
|---|------|-------|----------|--------|
| 1.1 | Backend | Duplicate User entity on same table | 🔴 Critical | ✅ Fixed |
| 1.2 | Frontend | `getSocket()` disconnects on every call | 🔴 Critical | ✅ Fixed |
| 1.3 | Frontend | `useSocket` cleanup logic inverted | 🔴 Critical | ✅ Fixed |
| 1.4 | Backend | RabbitMQ channel undefined after failed connect | 🔴 Critical | ✅ Fixed |
| 1.5 | Backend | Redis key type conflict (SETEX vs ZADD) | 🔴 Critical | ✅ Fixed |
| 1.6 | Backend | Broken route ordering in TeamsController | 🔴 Critical | ✅ Fixed |
| 2.1 | Backend | No auth guards on most controllers | 🟠 Security | ✅ Fixed |
| 2.2 | Backend | `password_hash` exposed in API responses | 🟠 Security | ✅ Fixed |
| 2.3 | Backend | `updatePassword` skips current password check | 🟠 Security | ✅ Fixed |
| 2.4 | Backend | JWT fallback to hardcoded secret | 🟠 Security | ✅ Fixed |
| 2.5 | Backend | No rate limiting on auth endpoints | 🟠 Security | ✅ Fixed |
| 3.1 | Frontend | Hardcoded `user_id: 1` in join match | 🟡 Bug | ✅ Fixed |
| 3.2 | Frontend | Mock user "Alex Johnson" hardcoded in Dashboard | 🟡 Bug | ✅ Fixed |
| 3.3 | Frontend | Stats `fetchUserData` never called | 🟡 Bug | ✅ Fixed |
| 3.4 | Frontend | `TeamMember.user.username` doesn't exist (should be `.name`) | 🟡 Bug | ✅ Fixed |
| 3.5 | Frontend | "Joined Matches" tab always empty | 🟡 Bug | ✅ Fixed |
| 3.6 | Frontend | "My Hosted Matches" uses hardcoded mock data | 🟡 Bug | ✅ Fixed |
| 3.7 | Frontend | No global auth context | 🟡 Bug | ✅ Fixed |
| 3.8 | Frontend | Settings loads with fake placeholder data | 🟡 Bug | ✅ Fixed |
| 4.1 | Backend | Workers are TODO stubs | 🔵 Missing | ⏳ Pending |
| 4.2 | Backend | No leaderboard HTTP endpoint | 🔵 Missing | ⏳ Pending |
| 4.3 | Backend | `socket-io-redis` imported but not configured | 🔵 Missing | ⏳ Pending |
| 4.4 | Backend | `ioredis` duplicated in deps/devDeps | 🔵 Missing | ✅ Fixed |
| 4.5 | Backend | Invitation responses broadcast to all clients | 🔵 Missing | ✅ Fixed |
| 4.6 | Backend | `ChatGateway` is dead code conflicting with `SocketGateway` | 🔵 Missing | ✅ Fixed |
| 5.1 | Backend | `synchronize: true` risk in non-dev environments | ⚪ Quality | ✅ Fixed |
| 5.2 | Backend | No pagination on list endpoints | ⚪ Quality | ⏳ Pending |
| 5.3 | Frontend | `window.prompt`/`alert` used for UX | ⚪ Quality | ⏳ Pending |
| 5.4 | Frontend | `ProtectedRoute` causes unnecessary loading flash | ⚪ Quality | ✅ Fixed |
