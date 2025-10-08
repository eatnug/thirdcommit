import type { ITodoRepository } from '@/application/ports/todo.repository.port'
import { TodoNotFoundError } from '@/domain/errors/todo.error'

export async function deleteTodoUseCase(
  repository: ITodoRepository,
  todoId: string
): Promise<void> {
  const todo = await repository.getTodoById(todoId)

  if (!todo) {
    throw new TodoNotFoundError(todoId)
  }

  await repository.deleteTodo(todoId)
}
