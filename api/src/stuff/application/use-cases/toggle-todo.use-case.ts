import type { Todo } from '@/stuff/domain/entities/todo.entity';
import type { ITodoRepository } from '@/stuff/application/ports/todo.repository.port';
import { TodoNotFoundError } from '@/stuff/domain/errors/todo.error';

/**
 * Toggle Todo Use Case
 *
 * Todo의 완료 상태 토글
 */
export async function toggleTodoUseCase(
  repository: ITodoRepository,
  id: string,
): Promise<Todo> {
  // 1. Get existing todo
  const todo = await repository.findById(id);
  if (!todo) {
    throw new TodoNotFoundError(id);
  }

  // 2. Toggle completed status
  return await repository.update(id, {
    completed: !todo.completed,
  });
}
