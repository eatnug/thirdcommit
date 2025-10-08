import type { CreateTodoDto } from '@/domain/dto/create-todo.dto'

export type ValidationResult = {
  isValid: boolean
  errors: {
    title?: string
    description?: string
  }
}

export function validateTodoForm(data: CreateTodoDto): ValidationResult {
  const errors: { title?: string; description?: string } = {}

  if (!data.title.trim()) {
    errors.title = 'Title is required'
  }

  if (data.title.length > 100) {
    errors.title = 'Title must be less than 100 characters'
  }

  if (data.description && data.description.length > 500) {
    errors.description = 'Description must be less than 500 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
