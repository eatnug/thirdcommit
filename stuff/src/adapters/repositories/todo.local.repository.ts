import type { Todo } from '@/domain/entities/todo.entity'
import type { ITodoRepository } from '@/application/ports/todo.repository.port'
import { localStorageService } from '@/infrastructure/storage/local-storage'

const STORAGE_KEY = 'todos'

/**
 * LocalStorage Adapter for Todo Repository
 *
 * ITodoRepository 인터페이스(Port)의 구현체(Adapter).
 * 나중에 API로 바꾸려면 ApiTodoRepository를 만들어서 교체하면 됨.
 */
class LocalTodoRepository implements ITodoRepository {
  async getTodos(): Promise<Todo[]> {
    const stored = localStorageService.getItem<Todo[]>(STORAGE_KEY)
    if (!stored) return []

    // LocalStorage는 Date를 문자열로 저장하므로 복원
    return stored.map(todo => ({
      ...todo,
      createdAt: new Date(todo.createdAt)
    }))
  }

  async getTodoById(id: string): Promise<Todo | null> {
    const todos = await this.getTodos()
    return todos.find(t => t.id === id) || null
  }

  async createTodo(todo: Todo): Promise<Todo> {
    const todos = await this.getTodos()
    localStorageService.setItem(STORAGE_KEY, [...todos, todo])
    return todo
  }

  async updateTodo(todo: Todo): Promise<Todo> {
    const todos = await this.getTodos()
    const updated = todos.map(t => t.id === todo.id ? todo : t)
    localStorageService.setItem(STORAGE_KEY, updated)
    return todo
  }

  async deleteTodo(id: string): Promise<void> {
    const todos = await this.getTodos()
    const filtered = todos.filter(t => t.id !== id)
    localStorageService.setItem(STORAGE_KEY, filtered)
  }
}

export const localTodoRepository: ITodoRepository = new LocalTodoRepository()
