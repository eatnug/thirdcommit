import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * My Feed Domain 전용 Prisma Client
 *
 * - my_feed 스키마만 접근 가능하도록 제한
 * - 다른 도메인(stuff 등)에는 접근 불가
 */
@Injectable()
export class MyFeedPrismaClient implements OnModuleInit, OnModuleDestroy {
  private prisma = new PrismaClient();

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  /**
   * MyFeed 스키마만 노출
   */
  get myFeed() {
    return this.prisma.myFeed;
  }

  /**
   * 트랜잭션이 필요한 경우 사용
   */
  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma);
  }
}
