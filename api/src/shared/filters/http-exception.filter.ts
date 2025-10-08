import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * 공통 HTTP Exception Filter
 *
 * - Domain Error를 HTTP Response로 변환
 * - 모든 도메인에서 공통으로 사용
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message;

    // HttpException 처리
    if (exception instanceof HttpException) {
      status = exception.getStatus();
    }
    // Domain Error 처리는 각 도메인에서 확장
    else {
      status = this.mapDomainErrorToStatus(exception);
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Domain Error를 HTTP Status Code로 매핑
   * 하위 클래스에서 오버라이드하여 도메인별 에러 처리
   */
  protected mapDomainErrorToStatus(exception: Error): HttpStatus {
    // 기본값: INTERNAL_SERVER_ERROR
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
