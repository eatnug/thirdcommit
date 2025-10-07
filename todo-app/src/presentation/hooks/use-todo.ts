import { useState, useEffect } from 'react'
import type { Todo } from '@/domain/entities/todo.entity'
import { getTodoByIdUseCase } from '@/application/use-cases/get-todo-by-id.use-case'
import { container } from '@/application/di/container'

export function useTodo(id: string) {
  const [todo, setTodo] = useState<Todo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadTodo = async () => {
      try {
        setIsLoading(true)
        const repository = container.todoRepository
        const loadedTodo = await getTodoByIdUseCase(repository, id)
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
