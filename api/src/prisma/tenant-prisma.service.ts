import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContextService } from '../tenant/tenant-context.service';
import { PrismaClientManager } from './prisma-client-manager.service';

/**
 * Tenant-aware Prisma service
 * Automatically uses the correct schema based on tenant context
 */
@Injectable()
export class TenantPrismaService {
  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly prismaManager: PrismaClientManager,
  ) {}

  /**
   * Get Prisma client for current tenant
   */
  getClient(): PrismaClient {
    const schemaName = this.tenantContext.getSchemaName();
    return this.prismaManager.getSchemaClient(schemaName);
  }

  /**
   * Execute operation in tenant schema context
   * Sets PostgreSQL search_path to ensure queries run in correct schema
   */
  async executeInTenantContext<T>(
    operation: (client: PrismaClient) => Promise<T>,
  ): Promise<T> {
    const client = this.getClient();
    const schemaName = this.tenantContext.getSchemaName();

    // Set search_path to tenant schema
    await client.$executeRawUnsafe(`SET search_path TO ${schemaName}`);

    try {
      return await operation(client);
    } finally {
      // Reset to default search_path
      await client.$executeRawUnsafe(`SET search_path TO public`);
    }
  }

  /**
   * Get client for public schema (shared data)
   */
  getPublicClient(): PrismaClient {
    return this.prismaManager.getDefaultClient();
  }
}
