import type { Todo } from '@/stuff/domain/entities/todo.entity';
import type { ITodoRepository } from '@/stuff/application/ports/todo.repository.port';
import { TodoNotFoundError } from '@/stuff/domain/errors/todo.error';

/**
 * Get Todo By ID Use Case
 *
 * ID로 특정 Todo 조회
 */
export async function getTodoByIdUseCase(
  repository: ITodoRepository,
  id: string,
): Promise<Todo> {
  const todo = await repository.findById(id);

  if (!todo) {
    throw new TodoNotFoundError(id);
  }

  return todo;
}
