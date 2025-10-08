import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Stuff Domain 전용 Prisma Client
 *
 * - stuff 스키마만 접근 가능하도록 제한
 * - 다른 도메인(myFeed 등)에는 접근 불가
 */
@Injectable()
export class StuffPrismaClient implements OnModuleInit, OnModuleDestroy {
  private prisma = new PrismaClient();

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  /**
   * Stuff 스키마만 노출
   */
  get stuff() {
    return this.prisma.stuff;
  }

  /**
   * 트랜잭션이 필요한 경우 사용
   */
  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma);
  }
}
