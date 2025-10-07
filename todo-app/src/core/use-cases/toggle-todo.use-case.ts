import type { Todo } from '@/core/entities/todo.entity'
import { TodoNotFoundError } from '@/core/errors/todo.error'
import { todoRepository } from '@/data/repositories/todo.repository'

export async function toggleTodoUseCase(todoId: string): Promise<Todo> {
  const todo = await todoRepository.getTodoById(todoId)

  if (!todo) {
    throw new TodoNotFoundError(todoId)
  }

  const updatedTodo: Todo = {
    ...todo,
    completed: !todo.completed,
  }

  return await todoRepository.updateTodo(updatedTodo)
}
