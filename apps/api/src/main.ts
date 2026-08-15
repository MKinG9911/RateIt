import * as dotenv from 'dotenv';
import * as path from 'path';

// Load root .env file
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter — prevent leaking internal errors
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Security headers
  app.use(helmet());

  // Flexible CORS configuration for local and cloud production
  const corsOriginEnv = process.env.API_CORS_ORIGIN || process.env.CORS_ORIGIN || '*';
  let corsOrigin: boolean | string | string[] | RegExp = true;

  if (corsOriginEnv === '*') {
    corsOrigin = true;
  } else if (corsOriginEnv.includes(',')) {
    corsOrigin = corsOriginEnv.split(',').map((o) => o.trim());
  } else if (corsOriginEnv) {
    corsOrigin = corsOriginEnv.trim();
  }

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Render uses PORT environment variable; fallback to API_PORT or 4000
  const port = Number(process.env.PORT || process.env.API_PORT || 4000);
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 RateIt API running on http://0.0.0.0:${port}/api/v1`);
}

bootstrap();
