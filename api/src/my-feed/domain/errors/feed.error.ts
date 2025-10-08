/**
 * Feed Not Found Error
 *
 * Feed를 찾을 수 없을 때 발생
 */
export class FeedNotFoundError extends Error {
  constructor(id: string) {
    super(`Feed with ID ${id} not found`);
    this.name = 'FeedNotFoundError';
  }
}

/**
 * Feed Validation Error
 *
 * Feed validation 실패 시 발생
 */
export class FeedValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FeedValidationError';
  }
}
