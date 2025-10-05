import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';

/**
 * Interceptor to extract tenant/project ID from request path
 * Runs before guards and has proper access to CLS context
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantInterceptor.name);

  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const pathSegments = request.path.split('/').filter(Boolean);

    this.logger.debug(`Interceptor - Request path: ${request.path}`);
    this.logger.debug(`Interceptor - Path segments: ${JSON.stringify(pathSegments)}`);

    // Expected path: ['api', 'project-a' or 'project-b', ...]
    if (pathSegments.length >= 2 && pathSegments[0] === 'api') {
      const projectId = pathSegments[1];
      this.logger.debug(`Interceptor - Setting tenantId to: ${projectId}`);
      this.cls.set('tenantId', projectId);

      // Verify it was set
      const verifyId = this.cls.get('tenantId');
      this.logger.debug(`Interceptor - Verified tenantId: ${verifyId}`);
    }

    return next.handle();
  }
}
