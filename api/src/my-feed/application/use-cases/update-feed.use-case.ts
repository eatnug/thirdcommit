import type { Feed } from '@/my-feed/domain/entities/feed.entity';
import type { UpdateFeedDto } from '@/my-feed/domain/dto/update-feed.dto';
import type { IFeedRepository } from '@/my-feed/application/ports/feed.repository.port';
import { FeedNotFoundError } from '@/my-feed/domain/errors/feed.error';

/**
 * Update Feed Use Case
 *
 * Feed 업데이트
 */
export async function updateFeedUseCase(
  repository: IFeedRepository,
  id: string,
  dto: UpdateFeedDto,
): Promise<Feed> {
  // 1. Verify feed exists
  const existingFeed = await repository.findById(id);
  if (!existingFeed) {
    throw new FeedNotFoundError(id);
  }

  // 2. Update
  return await repository.update(id, dto);
}
