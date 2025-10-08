import { useTodo } from '@/presentation/hooks/use-todo'
import { useRouteParams } from '@/presentation/hooks/use-route-params'
import { useNavigation } from '@/presentation/hooks/use-navigation'

export function TodoDetailPage() {
  const { id } = useRouteParams('todos/:id')
  const { todo, isLoading, error } = useTodo(id)
  const { goToTodoList } = useNavigation()

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (error || !todo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-600">Todo not found</p>
        <button
          onClick={goToTodoList}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
        >
          Back to List
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={goToTodoList}
        className="mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
      >
        ← Back to List
      </button>

      <div className="border border-gray-300 rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">{todo.title}</h1>

        <div className="mb-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm text-white ${
              todo.completed ? 'bg-green-500' : 'bg-orange-500'
            }`}
          >
            {todo.completed ? 'Completed' : 'Pending'}
          </span>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p>ID: {todo.id}</p>
          <p>Created: {todo.createdAt.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
