import { useTodos } from '@/presentation/hooks/use-todos'
import { TodoForm } from './TodoForm'
import { TodoItem } from './TodoItem'

export function TodoList() {
  const { todos, isLoading, error, createTodo, toggleTodo, deleteTodo } = useTodos()

  if (isLoading) {
    return <div>Loading todos...</div>
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error.message}</div>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>Todo List</h1>

      <TodoForm onSubmit={createTodo} />

      {todos.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999' }}>No todos yet. Add one above!</p>
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

      <div style={{ marginTop: '24px', fontSize: '14px', color: '#666' }}>
        <p>Total: {todos.length} | Completed: {todos.filter(t => t.completed).length}</p>
      </div>
    </div>
  )
}
