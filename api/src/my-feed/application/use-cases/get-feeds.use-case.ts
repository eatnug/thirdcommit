import type { Feed } from '@/my-feed/domain/entities/feed.entity';
import type { IFeedRepository } from '@/my-feed/application/ports/feed.repository.port';

/**
 * Get Feeds Use Case
 *
 * 모든 Feed 목록 조회
 * 순수 함수 - Repository를 매개변수로 주입받음
 */
export async function getFeedsUseCase(
  repository: IFeedRepository,
): Promise<Feed[]> {
  return await repository.findAll();
}
