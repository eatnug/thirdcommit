import { createBrowserRouter } from 'react-router-dom'
import { TodoListPage } from '@/presentation/pages/todos/TodoListPage'
import { TodoDetailPage } from '@/presentation/pages/todos/[id]/TodoDetailPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <TodoListPage />,
  },
  {
    path: '/todos/:id',
    element: <TodoDetailPage />,
  },
])
