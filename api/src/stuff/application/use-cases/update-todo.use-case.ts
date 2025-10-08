import type { Todo } from '@/stuff/domain/entities/todo.entity';
import type { UpdateTodoDto } from '@/stuff/domain/dto/update-todo.dto';
import type { ITodoRepository } from '@/stuff/application/ports/todo.repository.port';
import { TodoNotFoundError } from '@/stuff/domain/errors/todo.error';

/**
 * Update Todo Use Case
 *
 * Todo 업데이트
 */
export async function updateTodoUseCase(
  repository: ITodoRepository,
  id: string,
  dto: UpdateTodoDto,
): Promise<Todo> {
  // 1. Verify todo exists
  const existingTodo = await repository.findById(id);
  if (!existingTodo) {
    throw new TodoNotFoundError(id);
  }

  // 2. Update
  return await repository.update(id, dto);
}
