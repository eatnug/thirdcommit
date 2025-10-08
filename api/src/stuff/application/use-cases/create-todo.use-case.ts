import type { Todo } from '@/stuff/domain/entities/todo.entity';
import type { CreateTodoDto } from '@/stuff/domain/dto/create-todo.dto';
import type { ITodoRepository } from '@/stuff/application/ports/todo.repository.port';
import { validateTodo } from '@/stuff/domain/validators/todo.validator';
import { TodoValidationError } from '@/stuff/domain/errors/todo.error';

/**
 * Create Todo Use Case
 *
 * Todo 생성 유스케이스
 * 1. Validation
 * 2. Business logic (데이터 정제)
 * 3. Persistence
 */
export async function createTodoUseCase(
  repository: ITodoRepository,
  dto: CreateTodoDto,
): Promise<Todo> {
  // 1. Validation
  const validation = validateTodo(dto);
  if (!validation.isValid) {
    const errorMessage = Object.values(validation.errors).join(', ');
    throw new TodoValidationError(errorMessage);
  }

  // 2. Business logic - 데이터 정제
  const todoData: CreateTodoDto = {
    title: dto.title.trim(),
    description: dto.description?.trim(),
  };

  // 3. Persistence
  return await repository.create(todoData);
}
