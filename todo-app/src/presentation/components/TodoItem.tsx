import type { Todo } from '@/core/entities/todo.entity'
import { useNavigation } from '@/presentation/hooks/use-navigation'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const { goToTodoDetail } = useNavigation()

  return (
    <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg mb-2 hover:bg-gray-50 transition-colors">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="cursor-pointer w-4 h-4"
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
      />
      <span
        onClick={() => goToTodoDetail(todo.id)}
        className={`flex-1 cursor-pointer hover:text-blue-600 ${
          todo.completed ? 'line-through text-gray-400' : 'text-gray-900'
        }`}
      >
        {todo.title}
      </span>
      <button
        onClick={() => onDelete(todo.id)}
        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        aria-label={`Delete "${todo.title}"`}
      >
        Delete
      </button>
    </div>
  )
}
