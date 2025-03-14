import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Configure body parser limits
  app.use(json({ limit: '50mb' }));

  // Enable CORS with complete configuration
  app.enableCors({
    origin: [
      'http://localhost:8080',
      'http://localhost:5173',
      'https://invoica-frontend-yossigruner-gmailcoms-projects.vercel.app',
      'https://invoica.vercel.app',
      process.env.FRONTEND_URL
    ].filter((origin): origin is string => !!origin),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Invoica API')
    .setDescription('The Invoica API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Start the server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap(); 