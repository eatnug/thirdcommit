import type { Todo } from '@/core/entities/todo.entity'
import { todoRepository } from '@/data/repositories/todo.repository'

export async function getTodosUseCase(): Promise<Todo[]> {
  return await todoRepository.getTodos()
}
