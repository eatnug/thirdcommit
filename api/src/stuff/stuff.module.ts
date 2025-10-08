import { Module } from '@nestjs/common';
import { TodoController } from '@/stuff/presentation/controllers/todo.controller';
import { TodoPrismaRepository } from '@/stuff/adapters/repositories/todo.prisma.repository';
import { TODO_REPOSITORY } from '@/stuff/application/ports/todo.repository.port';
import { StuffPrismaClient } from '@/stuff/infrastructure/prisma/stuff-prisma.client';

/**
 * Stuff Module
 *
 * Clean Architecture 기반 모듈 구성:
 * - Presentation Layer: TodoController
 * - Application Layer: Use Cases (순수 함수)
 * - Adapters Layer: TodoPrismaRepository
 * - Infrastructure Layer: StuffPrismaClient (stuff 스키마만 접근)
 *
 * DI 설정:
 * - StuffPrismaClient: stuff 도메인 전용 Prisma Client
 * - TODO_REPOSITORY: TodoPrismaRepository로 바인딩
 */
@Module({
  imports: [],
  controllers: [TodoController],
  providers: [
    StuffPrismaClient,
    {
      provide: TODO_REPOSITORY,
      useClass: TodoPrismaRepository,
    },
  ],
  exports: [TODO_REPOSITORY],
})
export class StuffModule {}
