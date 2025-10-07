import { useState, useEffect, useCallback } from 'react'
import type { Todo } from '@/domain/entities/todo.entity'
import type { CreateTodoDto } from '@/domain/dto/create-todo.dto'
import { getTodosUseCase } from '@/application/use-cases/get-todos.use-case'
import { createTodoUseCase } from '@/application/use-cases/create-todo.use-case'
import { toggleTodoUseCase } from '@/application/use-cases/toggle-todo.use-case'
import { deleteTodoUseCase } from '@/application/use-cases/delete-todo.use-case'
import { container } from '@/application/di/container'

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const repository = container.todoRepository

  const loadTodos = useCallback(async () => {
    try {
      setIsLoading(true)
      const loadedTodos = await getTodosUseCase(repository)
      setTodos(loadedTodos)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [repository])

  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  const createTodo = useCallback(async (dto: CreateTodoDto) => {
    try {
      await createTodoUseCase(repository, dto)
      await loadTodos()
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [repository, loadTodos])

  const toggleTodo = useCallback(async (todoId: string) => {
    try {
      await toggleTodoUseCase(repository, todoId)
      await loadTodos()
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [repository, loadTodos])

  const deleteTodo = useCallback(async (todoId: string) => {
    try {
      await deleteTodoUseCase(repository, todoId)
      await loadTodos()
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [repository, loadTodos])

  return {
    todos,
    isLoading,
    error,
    createTodo,
    toggleTodo,
    deleteTodo,
  }
}
