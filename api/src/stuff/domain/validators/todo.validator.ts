import type { CreateTodoDto } from '@/stuff/domain/dto/create-todo.dto';

/**
 * Validation Result
 */
export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

/**
 * Todo Validator
 *
 * 순수 함수 기반 validation
 * 프레임워크에 의존하지 않음
 */
export function validateTodo(dto: CreateTodoDto): ValidationResult {
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
