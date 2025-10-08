import { Injectable } from '@nestjs/common';
import type { Feed } from '@/my-feed/domain/entities/feed.entity';
import type { CreateFeedDto } from '@/my-feed/domain/dto/create-feed.dto';
import type { UpdateFeedDto } from '@/my-feed/domain/dto/update-feed.dto';
import type { IFeedRepository } from '@/my-feed/application/ports/feed.repository.port';
import { MyFeedPrismaClient } from '@/my-feed/infrastructure/prisma/my-feed-prisma.client';

/**
 * Prisma 기반 Feed Repository 구현
 *
 * - IFeedRepository Port 구현
 * - MyFeedPrismaClient를 통해 my_feed 스키마에만 접근
 */
@Injectable()
export class FeedPrismaRepository implements IFeedRepository {
  constructor(private readonly prisma: MyFeedPrismaClient) {}

  async findAll(): Promise<Feed[]> {
    const feeds = await this.prisma.myFeed.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return feeds.map(this.mapToFeed);
  }

  async findById(id: string): Promise<Feed | null> {
    const feed = await this.prisma.myFeed.findUnique({
      where: { id },
    });
    return feed ? this.mapToFeed(feed) : null;
  }

  async create(data: CreateFeedDto): Promise<Feed> {
    const feed = await this.prisma.myFeed.create({
      data,
    });
    return this.mapToFeed(feed);
  }

  async update(id: string, data: UpdateFeedDto): Promise<Feed> {
    const feed = await this.prisma.myFeed.update({
      where: { id },
      data,
    });
    return this.mapToFeed(feed);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.myFeed.delete({
      where: { id },
    });
  }

  /**
   * Prisma model → Domain entity 변환
   * null을 undefined로 변환
   */
  private mapToFeed(prismaModel: any): Feed {
    return {
      id: prismaModel.id,
      title: prismaModel.title,
      description: prismaModel.description ?? undefined,
      completed: prismaModel.completed,
      createdAt: prismaModel.createdAt,
      updatedAt: prismaModel.updatedAt,
    };
  }
}
