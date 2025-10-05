import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Manages Prisma client instances for different schemas
 * Provides connection pooling and lifecycle management
 */
@Injectable()
export class PrismaClientManager implements OnModuleInit, OnModuleDestroy {
  private readonly clients = new Map<string, PrismaClient>();
  private readonly defaultClient: PrismaClient;

  constructor() {
    this.defaultClient = new PrismaClient();
  }

  async onModuleInit() {
    await this.defaultClient.$connect();
  }

  async onModuleDestroy() {
    await this.defaultClient.$disconnect();
    // Disconnect all schema-specific clients
    for (const client of this.clients.values()) {
      await client.$disconnect();
    }
  }

  /**
   * Get Prisma client for a specific schema
   */
  getSchemaClient(schemaName: string): PrismaClient {
    if (!this.clients.has(schemaName)) {
      const client = new PrismaClient();
      this.clients.set(schemaName, client);
    }
    return this.clients.get(schemaName)!;
  }

  /**
   * Get default Prisma client (public schema)
   */
  getDefaultClient(): PrismaClient {
    return this.defaultClient;
  }
}
