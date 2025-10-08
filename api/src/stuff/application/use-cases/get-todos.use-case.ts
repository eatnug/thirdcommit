import type { Todo } from '@/stuff/domain/entities/todo.entity';
import type { ITodoRepository } from '@/stuff/application/ports/todo.repository.port';

/**
 * Get Todos Use Case
 *
 * 모든 Todo 목록 조회
 * 순수 함수 - Repository를 매개변수로 주입받음
 */
export async function getTodosUseCase(
  repository: ITodoRepository,
): Promise<Todo[]> {
  return await repository.findAll();
}
