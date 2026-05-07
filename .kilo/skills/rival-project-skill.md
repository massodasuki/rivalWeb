# Rival Project Skill

This skill provides project-specific guidance for working with the Rival SaaS sports matchmaking platform to prevent AI hallucinations and ensure accurate, consistent responses.

## Project Overview
Rival is a sports matchmaking platform for futsal, basketball, and other sports with:
- Frontend: ReactJS
- Backend: NestJS
- Database: PostgreSQL
- Real-time: Socket.io
- Caching: Redis
- Async Tasks: RabbitMQ
- Deployment: Docker
- Authentication: JWT

## Key Project Conventions

### Backend (NestJS) Conventions
1. **Module Structure**: Each feature has its own module under `src/modules/`
   - Controllers: `[feature].controller.ts`
   - Services: `[feature].service.ts`
   - DTOs: `dto/` directory within module
   - Entities: `entities/` directory within module

2. **Database Entities**: 
   - Located in `src/modules/[feature]/entities/`
   - Named as `[feature].entity.ts`
   - Example: `src/modules/matches/entities/match.entity.ts`

3. **Configuration**:
   - Config files in `src/config/`
   - Database: `database.config.ts`
   - Redis: `redis.config.ts`
   - RabbitMQ: `rabbitmq.config.ts`
   - JWT: `jwt.config.ts`

4. **Environment Variables**:
   - Defined in `.env.example` in backend root
   - Used with `@nestjs/config` and `process.env`
   - Common vars: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `REDIS_URL`, `RABBITMQ_URL`, `JWT_SECRET`, `PORT`, `NODE_ENV`

### Frontend (ReactJS) Conventions
1. **Component Organization**:
   - Reusable components: `src/components/common/`
   - Feature-specific components: `src/components/[feature]/`
   - Page components: `src/pages/`

2. **State Management**:
   - Custom hooks: `src/hooks/`
   - Context API: `src/contexts/`
   - Services for API calls: `src/services/`

3. **Styling**:
   - Global styles: `src/styles/global.css`
   - Theme: `src/styles/theme.js`
   - Component-specific styles: `src/styles/components/`

4. **Environment Variables**:
   - Prefixed with `REACT_APP_`
   - Defined in `.env.example` in frontend root
   - Common vars: `REACT_APP_API_URL`, `REACT_APP_SOCKET_URL`

### Docker Conventions
1. **Service Separation**:
   - Each service has its own Dockerfile
   - Frontend: `frontend/Dockerfile`
   - Backend: `backend/Dockerfile`

2. **docker-compose.yml**:
   - Defines all services: frontend, backend, postgres, redis, rabbitmq
   - Uses bridge network: `rival-network`
   - Exposes necessary ports:
     - Frontend: 3000
     - Backend: 3001
     - Postgres: 5432
     - Redis: 6379
     - RabbitMQ: 5672 (AMQP), 15672 (Management UI)

### Common Pitfalls to Avoid (Hallucination Prevention)
1. **Do NOT assume**:
   - That entities are in a shared directory (they're module-specific)
   - That the backend uses Express (it uses NestJS)
   - That state management uses Redux (it uses React Context and custom hooks)
   - That the frontend uses Next.js (it uses Create React App/Vite with plain React)

2. **Always verify**:
   - Entity locations before referencing them
   - Module imports in backend files
   - Hook usage in frontend components
   - Environment variable naming conventions
   - Docker service dependencies in docker-compose.yml

3. **When in doubt, check**:
   - The actual file structure
   - Existing similar implementations
   - Configuration files
   - Package.json for dependencies

## Useful Commands for This Project
- Backend development: `npm run start:dev` (in backend/)
- Frontend development: `npm start` (in frontend/)
- Docker compose: `docker-compose up -d`
- Running tests: `npm test` in respective directories
- Type checking: `npm run typecheck` (if configured)

## File Reference Patterns
When referring to files, use these exact patterns:
- Backend entity: `backend/src/modules/[feature]/entities/[feature].entity.ts`
- Backend controller: `backend/src/modules/[feature]/[feature].controller.ts`
- Backend service: `backend/src/modules/[feature]/[feature].service.ts`
- Frontend component: `frontend/src/components/[feature]/[ComponentName].jsx`
- Frontend hook: `frontend/src/hooks/use[FeatureName].js`
- Frontend page: `frontend/src/pages/[PageName]/[PageName].jsx`
- Docker compose: `docker-compose.yml`
- Backend Dockerfile: `backend/Dockerfile`
- Frontend Dockerfile: `frontend/Dockerfile`

## Getting Accurate Information
To avoid hallucinations when working with this codebase:
1. Use the glob tool to find files: `glob("**/[feature]*.ts")`
2. Use the read tool to examine file contents
3. Use the grep tool to search for patterns
4. Check existing similar implementations before creating new ones
5. Validate assumptions against actual file structure