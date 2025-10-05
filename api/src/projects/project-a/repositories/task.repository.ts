import { Injectable } from '@nestjs/common';
import { TenantPrismaService } from '../../../prisma/tenant-prisma.service';

export interface CreateTaskDto {
  title: string;
  description?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  completed?: boolean;
}

/**
 * Repository for Task entity in Project A schema
 * All database operations are automatically scoped to project_a schema
 */
@Injectable()
export class TaskRepository {
  constructor(private readonly prisma: TenantPrismaService) {}

  async findAll() {
    return this.prisma.executeInTenantContext(async (client) => {
      return client.task.findMany({
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async findOne(id: string) {
    return this.prisma.executeInTenantContext(async (client) => {
      return client.task.findUnique({
        where: { id },
      });
    });
  }

  async create(data: CreateTaskDto) {
    return this.prisma.executeInTenantContext(async (client) => {
      return client.task.create({
        data,
      });
    });
  }

  async update(id: string, data: UpdateTaskDto) {
    return this.prisma.executeInTenantContext(async (client) => {
      return client.task.update({
        where: { id },
        data,
      });
    });
  }

  async delete(id: string) {
    return this.prisma.executeInTenantContext(async (client) => {
      return client.task.delete({
        where: { id },
      });
    });
  }
}
