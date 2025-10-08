/**
 * Create Feed DTO
 *
 * Feed 생성 시 필요한 데이터
 * Domain layer의 순수한 타입
 */
export type CreateFeedDto = {
  title: string;
  description?: string;
};
