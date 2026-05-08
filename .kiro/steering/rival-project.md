# Rival Project — Kiro Steering Guide

This steering file provides authoritative, up-to-date guidance for working on the Rival sports matchmaking platform. Always follow these conventions to avoid incorrect assumptions and keep the codebase consistent.

---

## Project Overview

Rival is a sports matchmaking SaaS platform for futsal, basketball, tennis, and other sports. It lets players find matches, form teams, chat in real time, track stats, and earn achievements.

**Monorepo layout:**
```
rivalWeb/
├── backend/          # NestJS API
├── frontend/         # React + Vite SPA
├── rival_mobile/     # React Native app (separate)
├── docker-compose.yml
└── .env              # Root-level env (Docker overrides)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | NestJS 10 (TypeScript) |
| ORM | TypeORM 0.3 |
| Database | PostgreSQL (with PostGIS extension) |
| Caching | Redis via ioredis |
| Message queue | RabbitMQ via amqplib |
| Real-time | Socket.IO 4 (NestJS WebSocket Gateway) |
| Auth | Passport + JWT (`@nestjs/jwt`, `passport-jwt`) |
| Password hashing | bcryptjs |
| Rate limiting | `@nestjs/throttler` |
| Frontend framework | React 18 (TypeScript) |
| Build tool | Vite |
| Routing | React Router v6 |
| HTTP client | Axios |
| Real-time client | socket.io-client |
| Containerisation | Docker + Docker Compose |
| Web server (prod) | Nginx |

---

## Backend Conventions

### Module structure

Every feature lives under `backend/src/modules/<feature>/`:

```
backend/src/modules/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── dto/
│   └── *.dto.ts
└── entities/
    └── <feature>.entity.ts
```

**Do NOT** put entities in a shared directory. Each entity belongs to its own module.

### Canonical User entity

There is **one** User entity: `backend/src/modules/users/entities/user.entity.ts`

The auth module (`AuthModule`) imports `User` from the users module path:
```ts
import { User } from '../users/entities/user.entity';
```

Never create or reference a second User entity at `auth/entities/user.entity.ts` — that file was deleted to fix a critical duplicate-entity bug.

### Authentication & guards

- `JwtAuthGuard` is at `backend/src/modules/auth/guards/jwt-auth.guard.ts`
- It respects the `@Public()` decorator from `backend/src/common/decorators/public.decorator.ts`
- Apply `@UseGuards(JwtAuthGuard)` at the **controller class level** by default
- Use `@Public()` on individual methods that should be accessible without a token (e.g. `GET /matches`, `GET /teams`)
- **Never** leave a controller without `@UseGuards(JwtAuthGuard)` unless every route in it is intentionally public

```ts
// Correct pattern
@UseGuards(JwtAuthGuard)
@Controller('matches')
export class MatchesController {
  @Public()
  @Get()
  findAll() { ... }   // public — no token needed

  @Post()
  create() { ... }    // protected — token required
}
```

### JWT secret

`JWT_SECRET` **must** be set in the environment. Both `AuthModule` and `SocketModule` throw at startup if it is missing. Never fall back to a hardcoded string.

### Rate limiting

`@nestjs/throttler` is configured globally in `AppModule` (60 req/min default). Auth endpoints (`/auth/login`, `/auth/register`) use a stricter override: 5 req/min.

### Password security

`UsersService.updatePassword()` **always** verifies the current password with bcrypt before allowing a change. Never skip this check.

### Hiding sensitive fields

`password_hash` is decorated with `@Exclude()` on the User entity. Auth service methods destructure it out before returning: `const { password_hash, ...safeUser } = user`.

### Route ordering rule

Static routes **must** be declared before parameterised routes in the same controller. Example:

```ts
@Get('user/invitations')   // ← MUST come first
getUserInvitations() { ... }

@Get(':id')                // ← parameterised route after
findOne() { ... }
```

### Redis key types

Two separate key namespaces exist for the leaderboard — never mix them:
- `leaderboard:cache` — JSON string stored with `SETEX`
- `leaderboard:scores` — sorted set managed with `ZADD` / `ZREVRANGE`

Constants are in `backend/src/common/constants/redis.ts` as `REDIS_KEYS.LEADERBOARD_CACHE` and `REDIS_KEYS.LEADERBOARD_SCORES`.

### RabbitMQ resilience

`RabbitmqService` handles a null channel gracefully. `publishToQueue` and `publishWithRoutingKey` check `if (!this.channel)` and log a warning instead of crashing. The service auto-reconnects after 5 seconds on connection loss.

### WebSocket gateway

- Single gateway: `SocketGateway` at `backend/src/modules/socket/socket.gateway.ts`
- Namespace: `/socket.io`
- `ChatGateway` (`backend/src/modules/chat/chat.gateway.ts`) is **dead code** — it is NOT registered in `ChatModule`. Do not add it back.
- Invitation response events (`RESPOND_MATCH_INVITATION`, `RESPOND_TEAM_INVITATION`) target the inviter's personal room (`user_<inviterId>`) — never `this.server.emit(...)` (broadcast to all).
- Every `RespondMatchInvitationDto` and `RespondTeamInvitationDto` includes `inviterId: number`.

### `synchronize` setting

TypeORM `synchronize` is controlled by the `DB_SYNC` env var:
```ts
synchronize: process.env.DB_SYNC === 'true'
```
Set `DB_SYNC=true` only in local development. Never enable it in staging or production.

### Workers

Workers live in `backend/src/workers/`. They consume RabbitMQ queues. Current status: stub implementations — email sending, match result DB writes, and achievement unlocking are not yet implemented.

---

## Frontend Conventions

### Auth context

There is a global `AuthContext` at `frontend/src/contexts/AuthContext.tsx`. It is the **single source of truth** for the logged-in user.

```ts
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, loading, token, logout } = useAuth();
}
```

**Never** read `localStorage.getItem('userId')` directly in a component. Use `user?.id` from `useAuth()` instead.

`AuthProvider` wraps the entire app in `frontend/src/main.tsx`:
```tsx
<BrowserRouter>
  <AuthProvider>
    <App />
  </AuthProvider>
</BrowserRouter>
```

### Route protection

`ProtectedRoute` and `GuestRoute` in `App.tsx` use `AuthContext` — they do not have their own `useEffect`/loading state. Auth check is driven by the context's `loading` flag.

### Socket service

`socketService.ts` maintains a **singleton** socket connection. `getSocket()` returns the existing connected socket if the token hasn't changed — it does **not** disconnect and reconnect on every call.

```ts
// Correct — reuses existing connection
const socket = getSocket();

// Wrong — do not call getSocket() in multiple hooks expecting separate connections
```

Call `disconnectSocket()` explicitly on logout (already handled in `AuthContext.logout()`).

### `useSocket` hook

The cleanup `useEffect` in `useSocket` calls `disconnectSocket()` on unmount. It does **not** guard with `if (!socket.connected)` — that was an inverted bug that has been fixed.

### User field naming

The backend `User` entity uses `name` (not `username`). All frontend types and UI must use `.name`:

```ts
// Correct
member.user?.name

// Wrong — this field does not exist
member.user?.username
```

### API service pattern

All HTTP calls go through `frontend/src/services/api.ts` (Axios instance). The base URL is resolved from `VITE_BACKEND_URL` env var, falling back to an empty string (Vite proxy in dev).

Service files follow this pattern:
```
frontend/src/services/
├── api.ts           # Axios instance + interceptors
├── authService.ts
├── matchService.ts
├── teamService.ts
├── userService.ts
├── communityService.ts
├── chatService.ts
└── socketService.ts
```

### Environment variables

Frontend env vars are prefixed with `VITE_` (not `REACT_APP_`):
- `VITE_BACKEND_URL` — backend base URL (empty = use Vite proxy)
- `VITE_FRONTEND_URL` — frontend origin for CORS

---

## Environment Variables Reference

| Variable | Where used | Notes |
|---|---|---|
| `JWT_SECRET` | Backend | Required — app throws at startup if missing |
| `JWT_EXPIRES_IN` | Backend | Default `7d` |
| `DB_HOST` | Backend | Default `localhost` |
| `DB_PORT` | Backend | Default `5432` |
| `DB_USERNAME` | Backend | Default `rival_user` |
| `DB_PASSWORD` | Backend | Default `rival_pass` |
| `DB_DATABASE` | Backend | Default `rival_db` |
| `DB_SYNC` | Backend | Set to `true` only in local dev |
| `REDIS_HOST` | Backend | Default `localhost` |
| `REDIS_PORT` | Backend | Default `6379` |
| `RABBITMQ_URL` | Backend | Default `amqp://localhost:5672` |
| `PORT` | Backend | Default `3001` |
| `FRONTEND_URL` | Backend | Used for Socket.IO CORS |
| `VITE_BACKEND_URL` | Frontend | Empty string = Vite proxy |
| `VITE_FRONTEND_URL` | Frontend | Frontend origin |

---

## Docker Services

| Service | Port | Notes |
|---|---|---|
| backend | 3001 | NestJS API |
| frontend | 5173 / 80 | Vite dev / Nginx prod |
| postgres | 5432 | PostgreSQL + PostGIS |
| redis | 6379 | Cache + leaderboard sorted set |
| rabbitmq | 5672 / 15672 | AMQP / Management UI |

Network: `rival-network` (bridge)

---

## File Reference Patterns

```
# Backend
backend/src/modules/<feature>/<feature>.module.ts
backend/src/modules/<feature>/<feature>.controller.ts
backend/src/modules/<feature>/<feature>.service.ts
backend/src/modules/<feature>/entities/<feature>.entity.ts
backend/src/modules/<feature>/dto/<name>.dto.ts
backend/src/common/decorators/public.decorator.ts
backend/src/common/constants/redis.ts
backend/src/common/constants/queues.ts
backend/src/workers/<name>.worker.ts

# Frontend
frontend/src/contexts/AuthContext.tsx
frontend/src/services/<name>Service.ts
frontend/src/hooks/use<Name>.ts
frontend/src/pages/<PageName>.tsx
frontend/src/components/<ComponentName>.tsx
```

---

## Common Mistakes to Avoid

- **Do not** import `User` from `auth/entities/user.entity` — that file no longer exists
- **Do not** call `getSocket()` in multiple hooks expecting independent connections — it's a singleton
- **Do not** use `localStorage.getItem('userId')` in components — use `useAuth().user?.id`
- **Do not** use `this.server.emit(...)` for invitation responses — target `user_<id>` rooms
- **Do not** use `REDIS_KEYS.LEADERBOARD` — it no longer exists; use `LEADERBOARD_CACHE` or `LEADERBOARD_SCORES`
- **Do not** set `synchronize: true` unconditionally — use `DB_SYNC=true` env var
- **Do not** add `ChatGateway` back to `ChatModule` — it conflicts with `SocketGateway`
- **Do not** place static routes after parameterised routes in the same controller
- **Do not** skip the current-password check in `updatePassword`
- **Do not** return the raw `User` entity from auth endpoints — strip `password_hash` first
