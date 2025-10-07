import type { Todo } from '@/core/entities/todo.entity'
import { TodoNotFoundError } from '@/core/errors/todo.error'
import { todoRepository } from '@/data/repositories/todo.repository'

export async function getTodoByIdUseCase(id: string): Promise<Todo> {
  const todo = await todoRepository.getTodoById(id)

  if (!todo) {
    throw new TodoNotFoundError(id)
  }

  return todo
}
