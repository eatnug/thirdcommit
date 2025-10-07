import { useState, type FormEvent } from 'react'

interface TodoFormProps {
  onSubmit: (title: string) => Promise<void>
}

export function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      setIsSubmitting(true)
      await onSubmit(title)
      setTitle('')
    } catch (error) {
      console.error('Failed to create todo:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new todo..."
          disabled={isSubmitting}
          className="flex-1 px-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          aria-label="New todo title"
        />
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="px-6 py-2 text-base font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Adding...' : 'Add'}
        </button>
      </div>
    </form>
  )
}
