import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

/**
 * Guard to validate tenant/project access
 * Ensures the project ID is whitelisted and matches expected format
 */
@Injectable()
export class TenantAccessGuard implements CanActivate {
  // Whitelist of allowed project IDs
  private readonly ALLOWED_PROJECTS = ['project-a', 'project-b'];

  constructor(private readonly cls: ClsService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Extract tenant ID from the request path
    const pathSegments = request.path.split('/').filter(Boolean);
    let tenantId: string | undefined;

    if (pathSegments.length >= 2 && pathSegments[0] === 'api') {
      tenantId = pathSegments[1];
      // Set it in CLS for downstream services
      this.cls.set('tenantId', tenantId);
    }

    // Validate tenant ID exists
    if (!tenantId) {
      throw new ForbiddenException('Project ID not found in request');
    }

    // Validate against whitelist
    if (!this.ALLOWED_PROJECTS.includes(tenantId)) {
      throw new ForbiddenException(
        `Invalid project ID: ${tenantId}. Allowed projects: ${this.ALLOWED_PROJECTS.join(', ')}`,
      );
    }

    return true;
  }
}
