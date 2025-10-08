import type { Todo } from '@/domain/entities/todo.entity'
import type { ITodoRepository } from '@/application/ports/todo.repository.port'
import { apiClient } from '@/infrastructure/http/api-client'

/**
 * API Adapter for Todo Repository
 *
 * ITodoRepository 인터페이스(Port)의 API 구현체(Adapter).
 * Backend API와 통신하여 Todo 데이터를 관리.
 */
class ApiTodoRepository implements ITodoRepository {
  private readonly basePath = '/api/stuff/todos'

  async getTodos(): Promise<Todo[]> {
    const todos = await apiClient.get<Todo[]>(this.basePath)
    // API response의 Date 문자열을 Date 객체로 변환
    return todos.map((todo) => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
    }))
  }

  async getTodoById(id: string): Promise<Todo | null> {
    try {
      const todo = await apiClient.get<Todo>(`${this.basePath}/${id}`)
      return {
        ...todo,
        createdAt: new Date(todo.createdAt),
      }
    } catch (error) {
      // 404 Not Found → null 반환
      if (error instanceof Error && error.message.includes('404')) {
        return null
      }
      throw error
    }
  }

  async createTodo(todo: Todo): Promise<Todo> {
    const created = await apiClient.post<Todo>(this.basePath, {
      title: todo.title,
      description: todo.description,
    })
    return {
      ...created,
      createdAt: new Date(created.createdAt),
    }
  }

  async updateTodo(todo: Todo): Promise<Todo> {
    const updated = await apiClient.put<Todo>(`${this.basePath}/${todo.id}`, {
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
    })
    return {
      ...updated,
      createdAt: new Date(updated.createdAt),
    }
  }

  async deleteTodo(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`)
  }
}

export const apiTodoRepository: ITodoRepository = new ApiTodoRepository()
