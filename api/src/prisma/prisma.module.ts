import { Module, Global } from '@nestjs/common';
import { PrismaClientManager } from './prisma-client-manager.service';
import { TenantPrismaService } from './tenant-prisma.service';

/**
 * Global Prisma module
 * Provides database access services throughout the application
 */
@Global()
@Module({
  providers: [PrismaClientManager, TenantPrismaService],
  exports: [PrismaClientManager, TenantPrismaService],
})
export class PrismaModule {}
