import { Injectable } from '@nestjs/common';
import type { Todo } from '@/stuff/domain/entities/todo.entity';
import type { CreateTodoDto } from '@/stuff/domain/dto/create-todo.dto';
import type { UpdateTodoDto } from '@/stuff/domain/dto/update-todo.dto';
import type { ITodoRepository } from '@/stuff/application/ports/todo.repository.port';
import { StuffPrismaClient } from '@/stuff/infrastructure/prisma/stuff-prisma.client';

/**
 * Prisma 기반 Todo Repository 구현
 *
 * - ITodoRepository Port 구현
 * - StuffPrismaClient를 통해 stuff 스키마에만 접근
 */
@Injectable()
export class TodoPrismaRepository implements ITodoRepository {
  constructor(private readonly prisma: StuffPrismaClient) {}

  async findAll(): Promise<Todo[]> {
    const todos = await this.prisma.stuff.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return todos.map(this.mapToTodo);
  }

  async findById(id: string): Promise<Todo | null> {
    const todo = await this.prisma.stuff.findUnique({
      where: { id },
    });
    return todo ? this.mapToTodo(todo) : null;
  }

  async create(data: CreateTodoDto): Promise<Todo> {
    const todo = await this.prisma.stuff.create({
      data,
    });
    return this.mapToTodo(todo);
  }

  async update(id: string, data: UpdateTodoDto): Promise<Todo> {
    const todo = await this.prisma.stuff.update({
      where: { id },
      data,
    });
    return this.mapToTodo(todo);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.stuff.delete({
      where: { id },
    });
  }

  /**
   * Prisma model → Domain entity 변환
   * null을 undefined로 변환
   */
  private mapToTodo(prismaModel: any): Todo {
    return {
      id: prismaModel.id,
      title: prismaModel.title,
      description: prismaModel.description ?? undefined,
      completed: prismaModel.completed,
      createdAt: prismaModel.createdAt,
      updatedAt: prismaModel.updatedAt,
    };
  }
}
