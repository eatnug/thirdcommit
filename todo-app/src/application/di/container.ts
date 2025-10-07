import type { ITodoRepository } from '@/application/ports/todo.repository.port'
import { localTodoRepository } from '@/adapters/repositories/todo.local.repository'

/**
 * Simple Dependency Injection Container
 *
 * Use Case들이 구체 구현체가 아닌 인터페이스에 의존하도록 하기 위한 컨테이너.
 * 나중에 LocalStorage → API로 바꿀 때 이 파일에서 한 줄만 수정하면 됨.
 *
 * 예: localTodoRepository → apiTodoRepository
 */
export const container = {
  todoRepository: localTodoRepository as ITodoRepository
}
