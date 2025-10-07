import type { Todo } from '@/core/entities/todo.entity'

/**
 * Todo Repository Port (Interface)
 *
 * Core 레이어에서 정의하는 인터페이스.
 * 구현체는 Data 레이어에 있음 (Hexagonal Architecture의 Port & Adapter 패턴)
 */
export interface ITodoRepository {
  getTodos(): Promise<Todo[]>
  getTodoById(id: string): Promise<Todo | null>
  createTodo(todo: Todo): Promise<Todo>
  updateTodo(todo: Todo): Promise<Todo>
  deleteTodo(id: string): Promise<void>
}
