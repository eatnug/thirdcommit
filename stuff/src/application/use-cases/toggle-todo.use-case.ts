import type { Todo } from '@/domain/entities/todo.entity'
import type { ITodoRepository } from '@/application/ports/todo.repository.port'
import { TodoNotFoundError } from '@/domain/errors/todo.error'

export async function toggleTodoUseCase(
  repository: ITodoRepository,
  todoId: string
): Promise<Todo> {
  const todo = await repository.getTodoById(todoId)

  if (!todo) {
    throw new TodoNotFoundError(todoId)
  }

  const updatedTodo: Todo = {
    ...todo,
    completed: !todo.completed,
  }

  return await repository.updateTodo(updatedTodo)
}
