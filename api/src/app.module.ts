import { Module } from '@nestjs/common';
import { StuffModule } from '@/stuff/stuff.module';
import { MyFeedModule } from '@/my-feed/my-feed.module';

/**
 * App Module
 *
 * 각 프로젝트 모듈은 독립적인 스키마에만 접근:
 * - StuffModule → stuff 스키마
 * - MyFeedModule → my_feed 스키마
 */
@Module({
  imports: [StuffModule, MyFeedModule],
})
export class AppModule {}
