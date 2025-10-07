import type { Todo } from '@/core/entities/todo.entity'
import { TodoValidationError } from '@/core/errors/todo.error'
import { todoRepository } from '@/data/repositories/todo.repository'

export async function createTodoUseCase(title: string): Promise<Todo> {
  if (!title.trim()) {
    throw new TodoValidationError('Todo title cannot be empty')
  }

  const newTodo: Todo = {
    id: crypto.randomUUID(),
    title: title.trim(),
    completed: false,
    createdAt: new Date(),
  }

  return await todoRepository.createTodo(newTodo)
}
