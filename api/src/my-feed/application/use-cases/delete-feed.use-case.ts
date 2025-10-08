import type { IFeedRepository } from '@/my-feed/application/ports/feed.repository.port';
import { FeedNotFoundError } from '@/my-feed/domain/errors/feed.error';

/**
 * Delete Feed Use Case
 *
 * Feed 삭제
 */
export async function deleteFeedUseCase(
  repository: IFeedRepository,
  id: string,
): Promise<void> {
  // 1. Verify feed exists
  const existingFeed = await repository.findById(id);
  if (!existingFeed) {
    throw new FeedNotFoundError(id);
  }

  // 2. Delete
  await repository.delete(id);
}
