import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SafarShare API')
    .setDescription('Pakistan Intercity Carpooling & Return Load Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & OTP')
    .addTag('users', 'User profiles & CNIC verification')
    .addTag('vehicles', 'Vehicle management')
    .addTag('trips', 'Trip posting & search')
    .addTag('bookings', 'Booking lifecycle')
    .addTag('ratings', 'Ratings & reviews')
    .addTag('notifications', 'Push notifications')
    .addTag('payments', 'Payment transactions')
    .addTag('admin', 'Admin dashboard')
    .addTag('location', 'Live GPS tracking')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 SafarShare API running on: http://localhost:${port}/api/v1`);
  logger.log(`📖 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
