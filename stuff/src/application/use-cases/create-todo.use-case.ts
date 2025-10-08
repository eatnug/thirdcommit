import type { Todo } from '@/domain/entities/todo.entity'
import type { CreateTodoDto } from '@/domain/dto/create-todo.dto'
import type { ITodoRepository } from '@/application/ports/todo.repository.port'
import { TodoValidationError } from '@/domain/errors/todo.error'
import { validateTodoForm } from '@/domain/validators/todo-form.validator'

export async function createTodoUseCase(
  repository: ITodoRepository,
  dto: CreateTodoDto
): Promise<Todo> {
  const validation = validateTodoForm(dto)

  if (!validation.isValid) {
    const errorMessage = Object.values(validation.errors).join(', ')
    throw new TodoValidationError(errorMessage)
  }

  const newTodo: Todo = {
    id: crypto.randomUUID(),
    title: dto.title.trim(),
    description: dto.description?.trim(),
    completed: false,
    createdAt: new Date(),
  }

  return await repository.createTodo(newTodo)
}
