import { useTodos } from '@/presentation/hooks/use-todos'
import { TodoForm } from '@/presentation/components/TodoForm'
import { TodoItem } from '@/presentation/components/TodoItem'

export function TodoListPage() {
  const { todos, isLoading, error, createTodo, toggleTodo, deleteTodo } = useTodos()

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading todos...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-600">Error: {error.message}</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Todo List</h1>

      <TodoForm onSubmit={createTodo} />

      {todos.length === 0 ? (
        <p className="text-center text-gray-500">No todos yet. Add one above!</p>
      ) : (
        <div>
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))}
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p>Total: {todos.length} | Completed: {todos.filter(t => t.completed).length}</p>
      </div>
    </div>
  )
}
