import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const httpLogger = new Logger('HTTP');
  
  // Enable CORS for frontend requests
  // FRONTEND_URL env var is set in docker-compose; falls back to localhost origins for local dev
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const corsOrigins = frontendUrl
    ? [frontendUrl, 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    preflightContinue: false,
  });

  // Request/response logging
  app.use((req: any, res: any, next: () => void) => {
    const start = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const url = req.originalUrl || req.url;
      httpLogger.log(`${req.method} ${url} ${res.statusCode} ${durationMs}ms`);
    });
    next();
  });
  
  // Configure ValidationPipe with whitelist (forbidNonWhitelisted disabled to allow additional fields)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
    disableErrorMessages: false,
  }));

  // Error logging
  app.useGlobalFilters(new AllExceptionsFilter());
  
  const port = configService.get('PORT') || process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
