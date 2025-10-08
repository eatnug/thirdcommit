import type { Todo } from '@/stuff/domain/entities/todo.entity';
import type { CreateTodoDto } from '@/stuff/domain/dto/create-todo.dto';
import type { UpdateTodoDto } from '@/stuff/domain/dto/update-todo.dto';

/**
 * Todo Repository Port (Interface)
 *
 * Application layer에서 정의하는 인터페이스
 * 실제 구현체는 Adapters layer에 있음 (Hexagonal Architecture)
 */
export interface ITodoRepository {
  findAll(): Promise<Todo[]>;
  findById(id: string): Promise<Todo | null>;
  create(data: CreateTodoDto): Promise<Todo>;
  update(id: string, data: UpdateTodoDto): Promise<Todo>;
  delete(id: string): Promise<void>;
}

/**
 * Dependency Injection Token
 */
export const TODO_REPOSITORY = Symbol('TODO_REPOSITORY');
