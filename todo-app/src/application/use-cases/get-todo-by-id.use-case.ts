import type { Todo } from '@/domain/entities/todo.entity'
import type { ITodoRepository } from '@/application/ports/todo.repository.port'
import { TodoNotFoundError } from '@/domain/errors/todo.error'

export async function getTodoByIdUseCase(
  repository: ITodoRepository,
  id: string
): Promise<Todo> {
  const todo = await repository.getTodoById(id)

  if (!todo) {
    throw new TodoNotFoundError(id)
  }

  return todo
}
