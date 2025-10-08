/**
 * Update Feed DTO
 *
 * Feed 수정 시 필요한 데이터
 * Domain layer의 순수한 타입
 */
export type UpdateFeedDto = {
  title?: string;
  description?: string;
  completed?: boolean;
};
