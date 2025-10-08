import type { Feed } from '@/my-feed/domain/entities/feed.entity';
import type { IFeedRepository } from '@/my-feed/application/ports/feed.repository.port';
import { FeedNotFoundError } from '@/my-feed/domain/errors/feed.error';

/**
 * Get Feed By ID Use Case
 *
 * ID로 특정 Feed 조회
 */
export async function getFeedByIdUseCase(
  repository: IFeedRepository,
  id: string,
): Promise<Feed> {
  const feed = await repository.findById(id);

  if (!feed) {
    throw new FeedNotFoundError(id);
  }

  return feed;
}
