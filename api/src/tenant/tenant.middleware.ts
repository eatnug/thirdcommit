import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

/**
 * Middleware to extract tenant/project ID from request path
 * Extracts from path pattern: /api/{projectId}/*
 * NOTE: Currently not used - tenant extraction happens in TenantAccessGuard
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Extract project ID from path: /api/{projectId}/*
    const pathSegments = req.path.split('/').filter(Boolean);

    // Expected path: ['api', 'project-a' or 'project-b', ...]
    if (pathSegments.length >= 2 && pathSegments[0] === 'api') {
      const projectId = pathSegments[1];
      this.cls.set('tenantId', projectId);
    }

    next();
  }
}
