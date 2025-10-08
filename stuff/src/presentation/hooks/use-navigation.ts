import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/presentation/routes/route-paths'

/**
 * 타입 안전한 네비게이션 훅
 */
export function useNavigation() {
  const navigate = useNavigate()

  return {
    goToTodoList: () => navigate(ROUTE_PATHS.TODOS.LIST),
    goToTodoDetail: (id: string) => navigate(ROUTE_PATHS.TODOS.DETAIL(id)),
    goBack: () => navigate(-1),
  }
}
