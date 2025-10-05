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
 * Repository for Task entity in Project B schema
 * All database operations are automatically scoped to project_b schema
 */
@Injectable()
export class TaskRepository {
  constructor(private readonly prisma: TenantPrismaService) {}

  async findAll() {
    return this.prisma.executeInTenantContext(async (client) => {
      return client.taskB.findMany({
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async findOne(id: string) {
    return this.prisma.executeInTenantContext(async (client) => {
      return client.taskB.findUnique({
        where: { id },
      });
    });
  }

  async create(data: CreateTaskDto) {
    return this.prisma.executeInTenantContext(async (client) => {
      return client.taskB.create({
        data,
      });
    });
  }

  async update(id: string, data: UpdateTaskDto) {
    return this.prisma.executeInTenantContext(async (client) => {
      return client.taskB.update({
        where: { id },
        data,
      });
    });
  }

  async delete(id: string) {
    return this.prisma.executeInTenantContext(async (client) => {
      return client.taskB.delete({
        where: { id },
      });
    });
  }
}
