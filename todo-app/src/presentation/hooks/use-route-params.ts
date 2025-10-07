import { useParams } from 'react-router-dom'
import type { RouteParams, RouteKey } from '@/presentation/routes/route-paths'

/**
 * 타입 안전한 useParams 래퍼
 *
 * @example
 * const { id } = useRouteParams('todos/:id')
 * // id는 자동으로 string 타입으로 추론됨
 */
export function useRouteParams<T extends RouteKey>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _route: T
): RouteParams[T] {
  const params = useParams()
  return params as RouteParams[T]
}
