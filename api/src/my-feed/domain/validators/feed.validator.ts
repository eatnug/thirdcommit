import type { CreateFeedDto } from '@/my-feed/domain/dto/create-feed.dto';

/**
 * Validation Result
 */
export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

/**
 * Feed Validator
 *
 * 순수 함수 기반 validation
 * 프레임워크에 의존하지 않음
 */
export function validateFeed(dto: CreateFeedDto): ValidationResult {
  const errors: Record<string, string> = {};

  // Title validation
  if (!dto.title || dto.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (dto.title.length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }

  // Description validation
  if (dto.description && dto.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
