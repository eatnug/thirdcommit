import type { Feed } from '@/my-feed/domain/entities/feed.entity';
import type { IFeedRepository } from '@/my-feed/application/ports/feed.repository.port';
import { FeedNotFoundError } from '@/my-feed/domain/errors/feed.error';

/**
 * Toggle Feed Use Case
 *
 * Feed의 완료 상태 토글
 */
export async function toggleFeedUseCase(
  repository: IFeedRepository,
  id: string,
): Promise<Feed> {
  // 1. Get existing feed
  const feed = await repository.findById(id);
  if (!feed) {
    throw new FeedNotFoundError(id);
  }

  // 2. Toggle completed status
  return await repository.update(id, {
    completed: !feed.completed,
  });
}
