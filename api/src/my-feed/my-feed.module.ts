import { Module } from '@nestjs/common';
import { FeedController } from '@/my-feed/presentation/controllers/feed.controller';
import { FeedPrismaRepository } from '@/my-feed/adapters/repositories/feed.prisma.repository';
import { FEED_REPOSITORY } from '@/my-feed/application/ports/feed.repository.port';
import { MyFeedPrismaClient } from '@/my-feed/infrastructure/prisma/my-feed-prisma.client';

/**
 * My Feed Module
 *
 * Clean Architecture 기반 모듈 구성:
 * - Presentation Layer: FeedController
 * - Application Layer: Use Cases (순수 함수)
 * - Adapters Layer: FeedPrismaRepository
 * - Infrastructure Layer: MyFeedPrismaClient (my_feed 스키마만 접근)
 *
 * DI 설정:
 * - MyFeedPrismaClient: my_feed 도메인 전용 Prisma Client
 * - FEED_REPOSITORY: FeedPrismaRepository로 바인딩
 */
@Module({
  imports: [],
  controllers: [FeedController],
  providers: [
    MyFeedPrismaClient,
    {
      provide: FEED_REPOSITORY,
      useClass: FeedPrismaRepository,
    },
  ],
  exports: [FEED_REPOSITORY],
})
export class MyFeedModule {}
