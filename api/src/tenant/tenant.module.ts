import { Module, Global } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';
import { TenantAccessGuard } from './tenant-access.guard';
import { TenantMiddleware } from './tenant.middleware';

/**
 * Global module for multi-tenant infrastructure
 * Provides tenant context management across the application
 */
@Global()
@Module({
  providers: [TenantContextService, TenantAccessGuard, TenantMiddleware],
  exports: [TenantContextService, TenantAccessGuard, TenantMiddleware],
})
export class TenantModule {}
