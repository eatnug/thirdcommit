import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

/**
 * Service to manage tenant context throughout the request lifecycle
 */
@Injectable()
export class TenantContextService {
  constructor(private readonly cls: ClsService) {}

  /**
   * Get current tenant ID from context
   */
  getTenantId(): string {
    const tenantId = this.cls.get<string>('tenantId');
    if (!tenantId) {
      throw new Error('Tenant context not set');
    }
    return tenantId;
  }

  /**
   * Get schema name for current tenant
   * Converts 'project-a' to 'project_a'
   */
  getSchemaName(): string {
    const tenantId = this.getTenantId();
    return tenantId.replace(/-/g, '_');
  }

  /**
   * Check if tenant ID is set
   */
  hasTenantId(): boolean {
    return !!this.cls.get<string>('tenantId');
  }
}
