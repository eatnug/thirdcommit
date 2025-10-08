import { HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from '@/shared/filters/http-exception.filter';
import {
  FeedNotFoundError,
  FeedValidationError,
} from '@/my-feed/domain/errors/feed.error';

/**
 * Feed Domain HTTP Exception Filter
 *
 * - 공통 HttpExceptionFilter 확장
 * - Feed 도메인 에러를 HTTP Status Code로 매핑
 */
export class FeedHttpExceptionFilter extends HttpExceptionFilter {
  protected mapDomainErrorToStatus(exception: Error): HttpStatus {
    if (exception instanceof FeedNotFoundError) {
      return HttpStatus.NOT_FOUND;
    } else if (exception instanceof FeedValidationError) {
      return HttpStatus.BAD_REQUEST;
    }

    return super.mapDomainErrorToStatus(exception);
  }
}
