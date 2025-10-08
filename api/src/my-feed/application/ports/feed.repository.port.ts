import type { Feed } from '@/my-feed/domain/entities/feed.entity';
import type { CreateFeedDto } from '@/my-feed/domain/dto/create-feed.dto';
import type { UpdateFeedDto } from '@/my-feed/domain/dto/update-feed.dto';

/**
 * Feed Repository Port (Interface)
 *
 * Application layer에서 정의하는 인터페이스
 * 실제 구현체는 Adapters layer에 있음 (Hexagonal Architecture)
 */
export interface IFeedRepository {
  findAll(): Promise<Feed[]>;
  findById(id: string): Promise<Feed | null>;
  create(data: CreateFeedDto): Promise<Feed>;
  update(id: string, data: UpdateFeedDto): Promise<Feed>;
  delete(id: string): Promise<void>;
}

/**
 * Dependency Injection Token
 */
export const FEED_REPOSITORY = Symbol('FEED_REPOSITORY');
