import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefixo global
  app.setGlobalPrefix('api');

  // Parsers
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Validação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS (permitir 5173 e 5174)
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
  ];
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // Swagger — UI em /api/docs e JSON em /api/docs-json
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mini Task-Scheduler')
    .setDescription('API para autenticação, tarefas e relatórios')
    .setVersion('1.0.0')
    .addBearerAuth() // Authorization: Bearer <token>
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, { useGlobalPrefix: true });

  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`Swagger UI:     http://localhost:${port}/api/docs`);
  console.log(`OpenAPI JSON:   http://localhost:${port}/api/docs-json`);
}

bootstrap();

