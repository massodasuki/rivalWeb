# Issues to Check in Rival Project

## Docker & Deployment Issues

### 1. Frontend Docker Configuration
**Location**: `docker-compose.yml` (lines 132-157)
- Frontend service maps port `3000:80` expecting nginx to serve the React app
- However, the frontend Dockerfile correctly builds the app and uses nginx to serve on port 80
- **Issue**: Environment variables `VITE_API_URL` and `VITE_BACKEND_URL` are empty in docker-compose but are referenced in frontend
- **Risk**: Frontend won't know where to connect to the backend

### 2. Backend Volume Mounts in Development
**Location**: `docker-compose.yml` (lines 128-130)
```yaml
volumes:
  - ./backend:/app
  - /app/node_modules
```
- **Issue**: Mounting the entire backend directory overwrites `node_modules` inside the container, then immediately trying to mount an empty `/app/node_modules` volume
- **Result**: Node modules won't be available in the container, causing startup failures
- **Fix**: Remove the `/app/node_modules` volume mount or use a named volume

### 3. Missing Frontend Build Step in docker-compose
**Location**: `docker-compose.yml` frontend service
- The frontend Dockerfile correctly implements a multi-stage build (builder -> nginx)
- However, in docker-compose, we're mounting the source code directly (`./frontend:/app`) which overrides the built assets
- **Issue**: Development setup overrides production build, meaning nginx serves unbuilt source code
- **Fix**: For development, either remove the volume mount or use a different approach

### 4. Port Mapping Inconsistency
**Location**: `docker-compose.yml` frontend service (line 143)
- Maps `3000:80` (host:container)
- **Issue**: This is actually correct for the nginx setup (serving on container port 80)
- **Note**: Previously identified as an issue, but actually correct given the nginx setup

## Backend Architecture Issues

### 5. Entity Naming Inconsistency
**Location**: `backend/src/modules/auth/entities/user.entity.ts` line 24
- Uses `password_hash` (snake_case) which matches the database schema in init-postgis.sql
- **Status**: This is actually correct and consistent with the database schema
- **Note**: Previously flagged as a potential issue, but it's properly aligned

### 6. JWT Secret Fallback Value
**Location**: `docker-compose.yml` lines 91, 104-105
```yaml
JWT_SECRET: ${JWT_SECRET:-your-super-secret-jwt-key-here}
RABBITMQ_USER: ${RABBITMQ_USER:-rival_user}
RABBITMQ_PASS: ${RABBITMQ_PASS:-rival_pass}
```
- **Issue**: Using hardcoded fallback values for secrets in docker-compose
- **Risk**: If `.env` file is missing or variables not set, uses weak, known secrets
- **Better approach**: Require these to be set, don't provide insecure fallbacks

### 7. Missing Validation Pipes
**Location**: `backend/src/modules/auth/auth.controller.ts` lines 11-18
```typescript
@Post('register')
async register(@Body() registerDto: RegisterDto) {
  return this.authService.register(registerDto);
}

@Post('login')
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```
- **Issue**: No validation pipes applied to DTOs
- **Risk**: Malformed data could reach service layer
- **Fix**: Add `@UsePipes(new ValidationPipe({ whitelist: true }))` or use global validation pipes

### 8. Healthcheck Command Fragility
**Location**: `docker-compose.yml` lines 120-125 (backend healthcheck)
```yaml
healthcheck:
  test: ["CMD-SHELL", "pgrep -f 'node.*dist/main' || exit 1"]
```
- **Issue**: Healthcheck depends on specific process name pattern
- **Risk**: If build output changes or process naming differs, healthcheck fails incorrectly
- **Better approach**: Use a proper health endpoint in the NestJS application

### 9. Missing Rate Limiting
**Location**: Not evident in auth controller
- **Issue**: No rate limiting on auth endpoints
- **Risk**: Vulnerable to brute force attacks on login/registration

## Frontend Issues

### 10. Environment Variable Handling
**Location**: `frontend/src/services/api.ts` lines 4-17
- **Issue**: The logic for determining backend URL is overly complex and potentially confusing
- **Current approach**: Checks VITE_BACKEND_URL first, then VITE_API_URL, then defaults to empty string
- **Risk**: Confusing precedence, especially since Vite only replaces VITE_* variables
- **Better approach**: Use a single environment variable or clarify the precedence

### 11. Missing API Request Cancellation
**Location**: `frontend/src/services/api.ts`
- **Issue**: No mechanism to cancel outgoing requests when components unmount
- **Risk**: Potential race conditions or state updates on unmounted components

### 12. Socket Hook Implementation
**Location**: Need to check `frontend/src/hooks/useSocket.ts` (file exists but need to verify)
- **Issue**: Need to verify hooks properly handle cleanup (especially socket hooks)
- **Risk**: Memory leaks or stale subscriptions

## Database & Migration Issues

### 13. Missing Migration Strategy
**Location**: Not evident in current code
- **Issue**: `synchronize: true` in development (from app.module.ts line 32) but no migration strategy visible
- **Risk**: In production, `synchronize: false` means schema changes won't be applied automatically
- **Need**: TypeORM migrations or similar strategy for schema evolution

### 14. PostGIS Initialization Verification
**Location**: `docker-compose.yml` lines 14-15 and `backend/init-postgis.sql`
```yaml
volumes:
  - ./backend/init-postgis.sql:/docker-entrypoint-initdb.d/init-postgis.sql:ro
```
- **Status**: The file exists and contains proper PostGIS extension creation and table schemas
- **Note**: Previously flagged as missing, but it's present and correct

## Security Issues

### 15. CORS Configuration
**Location**: `docker-compose.yml` line 99
```yaml
CORS_ORIGIN: http://localhost:3000
```
- **Issue**: Hardcoded origin in backend config
- **Risk**: Doesn't account for different deployment environments (staging, production)
- **Better**: Should be configurable per environment

## Code Quality Issues

### 16. Barrel File Anti-pattern
**Location**: `frontend/src/hooks/index.ts` (exists but need to check content)
- **Issue**: If exporting all hooks from index.ts, can cause unnecessary imports
- **Risk**: Bundle size increase if not tree-shakable properly

### 17. Inconsistent Naming in docker-compose
**Location**: `docker-compose.yml` 
- Service names: `postgres`, `redis`, `rabbitmq`, `backend`, `frontend`
- Container names: `rival-postgres`, `rival-redis`, `rival-rabbitmq`, `rival-backend`, `rival-frontend`
- **Issue**: Inconsistent naming pattern (some prefixed with `rival-`, some not)
- **Minor**: But could cause confusion

## Recommendations

1. **Fix Docker Volumes**: Remove problematic `/app/node_modules` mount from backend service
2. **Frontend Development Setup**: Either remove frontend volume mount for production-like behavior or use a proper development setup with hot reload
3. **Add Validation**: Implement validation pipes for all DTOs in backend controllers
4. **Improve Secrets Handling**: Remove insecure fallbacks for secrets in docker-compose
5. **Add Proper Healthchecks**: Implement health endpoints in NestJS app instead of fragile pgrep checks
6. **Add Migration Strategy**: Implement TypeORM migrations for schema evolution
7. **Environment Configuration**: Make CORS origins and other settings environment-specific
8. **Add Rate Limiting**: Protect auth endpoints with rate limiting to prevent brute force attacks
9. **Simplify Frontend API Config**: Clarify or simplify the environment variable usage in frontend API service
10. **Add Request Cancellation**: Implement request cancellation in frontend API service for unmounted components
11. **Verify Socket Hooks**: Ensure socket hooks properly clean up subscriptions to prevent memory leaks
12. **Add Startup Validation**: Validate required environment variables on application startup
13. **Consider Removing Barrel Files**: Or ensure they're properly optimized for tree shaking
14. **Standardize Naming**: Consider making docker-compose service and container naming consistent

## Files to Examine Further

1. `backend/src/modules/auth/entities/user.entity.ts` - Confirmed correct password field mapping
2. `frontend/src/services/api.ts` - Check API service implementation and environment variable handling
3. `frontend/src/hooks/useSocket.ts` - Verify socket cleanup implementation
4. `backend/init-postgis.sql` - Confirmed file exists and contains proper PostGIS setup
5. `backend/tsconfig.json` - Check if paths are configured properly
6. `frontend/tsconfig.json` - Check frontend build configuration
7. `frontend/src/hooks/index.ts` - Check barrel file exports
8. `backend/src/app.module.ts` - Check global validation pipe setup and synchronization setting