import { useState, type FormEvent } from 'react'
import type { CreateTodoDto } from '@/domain/dto/create-todo.dto'
import { validateTodoForm } from '@/domain/validators/todo-form.validator'

interface TodoFormProps {
  onSubmit: (dto: CreateTodoDto) => Promise<void>
}

export function TodoForm({ onSubmit }: TodoFormProps) {
  const [formData, setFormData] = useState<CreateTodoDto>({
    title: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validation = validateTodoForm(formData)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validation.isValid) return

    try {
      setIsSubmitting(true)
      await onSubmit({
        title: formData.title,
        description: formData.description || undefined,
      })
      setFormData({ title: '', description: '' })
    } catch (error) {
      console.error('Failed to create todo:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Add a new todo..."
            disabled={isSubmitting}
            className="flex-1 px-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            aria-label="New todo title"
          />
          {validation.errors.title && (
            <span className="text-sm text-red-500">{validation.errors.title}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description (optional)..."
            disabled={isSubmitting}
            className="flex-1 px-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
            aria-label="New todo description"
            rows={2}
          />
          {validation.errors.description && (
            <span className="text-sm text-red-500">{validation.errors.description}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !validation.isValid}
          className="px-6 py-2 text-base font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Adding...' : 'Add'}
        </button>
      </div>
    </form>
  )
}
