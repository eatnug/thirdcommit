import { useState, useEffect } from 'react'
import type { Todo } from '@/core/entities/todo.entity'
import { getTodoByIdUseCase } from '@/core/use-cases/get-todo-by-id.use-case'

export function useTodo(id: string) {
  const [todo, setTodo] = useState<Todo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadTodo = async () => {
      try {
        setIsLoading(true)
        const loadedTodo = await getTodoByIdUseCase(id)
        setTodo(loadedTodo)
        setError(null)
      } catch (err) {
        setError(err as Error)
        setTodo(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadTodo()
  }, [id])

  return { todo, isLoading, error }
}
