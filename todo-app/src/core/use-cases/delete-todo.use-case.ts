import { TodoNotFoundError } from '@/core/errors/todo.error'
import { todoRepository } from '@/data/repositories/todo.repository'

export async function deleteTodoUseCase(todoId: string): Promise<void> {
  const todo = await todoRepository.getTodoById(todoId)

  if (!todo) {
    throw new TodoNotFoundError(todoId)
  }

  await todoRepository.deleteTodo(todoId)
}
