# Rival SaaS Project Structure Plan

## Overview
Rival is a sports matchmaking platform for futsal, basketball, and other sports. This document outlines the complete project folder structure, including frontend (ReactJS), backend (NestJS), and Docker setup for all services.

## Tech Stack
- **Frontend**: ReactJS
- **Backend**: NestJS
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **Caching**: Redis
- **Async Tasks**: RabbitMQ
- **Deployment**: Docker
- **Authentication**: JWT

## Overall Project Structure
```
rival/
├── frontend/          # ReactJS application
├── backend/           # NestJS application
├── docker/            # Docker-related files
├── docker-compose.yml # Multi-service Docker setup
├── .env.example       # Environment variables template
└── README.md          # Project documentation
```

## Frontend Structure (ReactJS)
```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/        # Static assets (images, icons)
├── src/
│   ├── components/
│   │   ├── common/    # Reusable components (Button, Modal, etc.)
│   │   ├── auth/      # Authentication components (LoginForm, RegisterForm)
│   │   ├── matches/   # Match-related components (MatchCard, MatchList)
│   │   ├── profile/   # User profile components
│   │   └── layout/    # Layout components (Header, Footer, Sidebar)
│   ├── pages/
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── Dashboard/
│   │   ├── MatchDetails/
│   │   ├── Profile/
│   │   └── NotFound/
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useMatches.js
│   │   └── useSocket.js
│   ├── services/
│   │   ├── api.js     # Axios instance and API calls
│   │   ├── socket.js  # Socket.io client setup
│   │   └── auth.js    # Authentication service
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── MatchContext.js
│   ├── styles/
│   │   ├── global.css
│   │   ├── theme.js
│   │   └── components/ # Component-specific styles
│   ├── App.js
│   ├── index.js
│   └── setupTests.js
├── Dockerfile
├── package.json
├── .env.example
└── README.md
```

## Backend Structure (NestJS)
```
backend/
├── src/
│   ├── app/
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   └── app.service.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── local.strategy.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   └── token.dto.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   ├── matches/
│   │   │   ├── matches.controller.ts
│   │   │   ├── matches.module.ts
│   │   │   ├── matches.service.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │       └── match.entity.ts
│   │   ├── notifications/
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │       └── notification.entity.ts
│   │   └── chat/      # For real-time chat/messaging
│   │       ├── chat.gateway.ts
│   │       ├── chat.module.ts
│   │       └── dto/
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── rabbitmq.config.ts
│   │   └── jwt.config.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   └── dto/
│   ├── shared/
│   │   ├── entities/  # Shared entities if any
│   │   └── interfaces/
│   ├── main.ts
│   └── app.module.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── Dockerfile
├── package.json
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
├── .env.example
└── README.md
```

## Docker Setup

### docker-compose.yml
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://backend:3001
      - REACT_APP_SOCKET_URL=http://backend:3001
    depends_on:
      - backend
    networks:
      - rival-network

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://rival_user:rival_pass@postgres:5432/rival_db
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
      - JWT_SECRET=your_jwt_secret_here
    depends_on:
      - postgres
      - redis
      - rabbitmq
    networks:
      - rival-network

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=rival_db
      - POSTGRES_USER=rival_user
      - POSTGRES_PASSWORD=rival_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - rival-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - rival-network

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=guest
      - RABBITMQ_DEFAULT_PASS=guest
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - rival-network

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:

networks:
  rival-network:
    driver: bridge
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

## Environment Variables

### Frontend (.env.example)
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_SOCKET_URL=http://localhost:3001
```

### Backend (.env.example)
```
# Database
DATABASE_URL=postgresql://rival_user:rival_pass@localhost:5432/rival_db

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=1h

# App
PORT=3001
NODE_ENV=development

# Socket.io
CORS_ORIGIN=http://localhost:3000
```

## Next Steps
1. Initialize the project structure using the above folders
2. Set up package.json files for frontend and backend
3. Implement authentication with JWT
4. Create database entities and migrations
5. Implement Socket.io for real-time features
6. Set up Redis caching
7. Configure RabbitMQ for async tasks
8. Build and test the Docker setup