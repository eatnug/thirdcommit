import type { Feed } from '@/my-feed/domain/entities/feed.entity';
import type { CreateFeedDto } from '@/my-feed/domain/dto/create-feed.dto';
import type { IFeedRepository } from '@/my-feed/application/ports/feed.repository.port';
import { validateFeed } from '@/my-feed/domain/validators/feed.validator';
import { FeedValidationError } from '@/my-feed/domain/errors/feed.error';

/**
 * Create Feed Use Case
 *
 * Feed 생성 유스케이스
 * 1. Validation
 * 2. Business logic (데이터 정제)
 * 3. Persistence
 */
export async function createFeedUseCase(
  repository: IFeedRepository,
  dto: CreateFeedDto,
): Promise<Feed> {
  // 1. Validation
  const validation = validateFeed(dto);
  if (!validation.isValid) {
    const errorMessage = Object.values(validation.errors).join(', ');
    throw new FeedValidationError(errorMessage);
  }

  // 2. Business logic - 데이터 정제
  const feedData: CreateFeedDto = {
    title: dto.title.trim(),
    description: dto.description?.trim(),
  };

  // 3. Persistence
  return await repository.create(feedData);
}
