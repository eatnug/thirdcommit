/**
 * Todo Not Found Error
 *
 * Todo를 찾을 수 없을 때 발생
 */
export class TodoNotFoundError extends Error {
  constructor(id: string) {
    super(`Todo with ID ${id} not found`);
    this.name = 'TodoNotFoundError';
  }
}

/**
 * Todo Validation Error
 *
 * Todo validation 실패 시 발생
 */
export class TodoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TodoValidationError';
  }
}
