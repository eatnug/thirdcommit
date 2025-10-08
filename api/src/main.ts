import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend apps
  app.enableCors({
    origin: [
      'http://localhost:5173', // stuff (Vite default)
    ],
    credentials: true,
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 API Server running on http://localhost:${port}`);
  console.log(`📁 Stuff API: http://localhost:${port}/api/stuff/todos`);
  console.log(`📁 My Feed API: http://localhost:${port}/api/my-feed/feeds`);
}
bootstrap();
