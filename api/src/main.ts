import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend apps
  app.enableCors({
    origin: [
      'http://localhost:3000', // project-a-web
      'http://localhost:3001', // project-b-web
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

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 API Server running on http://localhost:${port}`);
  console.log(`📁 Project A API: http://localhost:${port}/api/project-a`);
  console.log(`📁 Project B API: http://localhost:${port}/api/project-b`);
}
bootstrap();
