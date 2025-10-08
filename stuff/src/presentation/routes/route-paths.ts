// 라우트 파라미터 타입 정의
export type RouteParams = {
  'todos/:id': { id: string }
}

// 타입 안전한 경로 정의
export const ROUTE_PATHS = {
  TODOS: {
    LIST: '/',
    DETAIL: (id: string) => `/todos/${id}` as const,
  },
} as const

// 타입 안전한 경로 키
export type RouteKey = keyof RouteParams
