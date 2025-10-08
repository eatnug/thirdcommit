import { HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from '@/shared/filters/http-exception.filter';
import {
  TodoNotFoundError,
  TodoValidationError,
} from '@/stuff/domain/errors/todo.error';

/**
 * Todo Domain HTTP Exception Filter
 *
 * - 공통 HttpExceptionFilter 확장
 * - Todo 도메인 에러를 HTTP Status Code로 매핑
 */
export class TodoHttpExceptionFilter extends HttpExceptionFilter {
  protected mapDomainErrorToStatus(exception: Error): HttpStatus {
    if (exception instanceof TodoNotFoundError) {
      return HttpStatus.NOT_FOUND;
    } else if (exception instanceof TodoValidationError) {
      return HttpStatus.BAD_REQUEST;
    }

    return super.mapDomainErrorToStatus(exception);
  }
}
