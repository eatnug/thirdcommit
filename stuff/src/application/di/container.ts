import type { ITodoRepository } from '@/application/ports/todo.repository.port'
import { apiTodoRepository } from '@/adapters/repositories/todo.api.repository'
// import { localTodoRepository } from '@/adapters/repositories/todo.local.repository'

/**
 * Simple Dependency Injection Container
 *
 * Use Case들이 구체 구현체가 아닌 인터페이스에 의존하도록 하기 위한 컨테이너.
 * LocalStorage → API로 전환 완료!
 *
 * 🎯 Clean Architecture의 핵심:
 * - 이 파일 한 줄만 수정하면 구현체 교체 완료
 * - Use Case 코드는 전혀 수정할 필요 없음
 * - Presentation Layer도 영향 받지 않음
 */
export const container = {
  todoRepository: apiTodoRepository as ITodoRepository,
  // 로컬 테스트 시 사용: localTodoRepository
}
