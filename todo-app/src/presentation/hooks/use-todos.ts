import { useState, useEffect, useCallback } from 'react'
import type { Todo } from '@/core/entities/todo.entity'
import { getTodosUseCase } from '@/core/use-cases/get-todos.use-case'
import { createTodoUseCase } from '@/core/use-cases/create-todo.use-case'
import { toggleTodoUseCase } from '@/core/use-cases/toggle-todo.use-case'
import { deleteTodoUseCase } from '@/core/use-cases/delete-todo.use-case'

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadTodos = useCallback(async () => {
    try {
      setIsLoading(true)
      const loadedTodos = await getTodosUseCase()
      setTodos(loadedTodos)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  const createTodo = useCallback(async (title: string) => {
    try {
      await createTodoUseCase(title)
      await loadTodos()
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadTodos])

  const toggleTodo = useCallback(async (todoId: string) => {
    try {
      await toggleTodoUseCase(todoId)
      await loadTodos()
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadTodos])

  const deleteTodo = useCallback(async (todoId: string) => {
    try {
      await deleteTodoUseCase(todoId)
      await loadTodos()
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [loadTodos])

  return {
    todos,
    isLoading,
    error,
    createTodo,
    toggleTodo,
    deleteTodo,
  }
}
