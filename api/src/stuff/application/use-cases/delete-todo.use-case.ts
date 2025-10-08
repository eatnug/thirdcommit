import type { ITodoRepository } from '@/stuff/application/ports/todo.repository.port';
import { TodoNotFoundError } from '@/stuff/domain/errors/todo.error';

/**
 * Delete Todo Use Case
 *
 * Todo 삭제
 */
export async function deleteTodoUseCase(
  repository: ITodoRepository,
  id: string,
): Promise<void> {
  // 1. Verify todo exists
  const existingTodo = await repository.findById(id);
  if (!existingTodo) {
    throw new TodoNotFoundError(id);
  }

  // 2. Delete
  await repository.delete(id);
}
