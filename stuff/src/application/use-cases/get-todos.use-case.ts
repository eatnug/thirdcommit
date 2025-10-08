import type { Todo } from '@/domain/entities/todo.entity'
import type { ITodoRepository } from '@/application/ports/todo.repository.port'

export async function getTodosUseCase(repository: ITodoRepository): Promise<Todo[]> {
  return await repository.getTodos()
}
