# Clean Architecture for Frontend Projects (Updated)

실전 Todo 앱 구현을 통해 검증된 프론트엔드 클린 아키텍처 가이드

## 핵심 원칙

### 1. 헥사고날 아키텍처 (Ports & Adapters)
- **Port (인터페이스)**: `core/ports`에 위치
- **Adapter (구현체)**: `data/repositories`에 위치
- Core는 Port에만 의존, 구현체는 교체 가능

### 2. 순수성의 동심원
```
┌─────────────────────────────────────┐
│   Presentation (React, Tailwind)    │  ← 가장 자주 변경
│   ┌─────────────────────────────┐   │
│   │   Infrastructure            │   │  ← 라이브러리 의존
│   │   ┌─────────────────────┐   │   │
│   │   │   Core (순수 TS)    │   │   │  ← 거의 변경 없음
│   │   │   - Entities        │   │   │
│   │   │   - Ports           │   │   │
│   │   │   - Use Cases       │   │   │
│   │   └─────────────────────┘   │   │
│   │   Data (Adapters)           │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 3. UI는 언제든 엎어질 수 있다
- **도메인 로직**: 순수 TypeScript로 작성 (React 의존성 없음)
- **UI Integration**: `presentation/hooks`에서만 React 사용
- **외부 라이브러리**: Infrastructure에 격리

## 폴더 구조

```
src/
├── core/                           # 도메인 레이어 (순수 TS, 의존성 0)
│   ├── entities/
│   │   └── todo.entity.ts         # type Todo = { ... }
│   ├── ports/
│   │   └── todo.repository.port.ts # interface ITodoRepository
│   ├── use-cases/
│   │   ├── get-todos.use-case.ts
│   │   ├── create-todo.use-case.ts
│   │   ├── toggle-todo.use-case.ts
│   │   └── delete-todo.use-case.ts
│   └── errors/
│       └── todo.error.ts
│
├── data/                           # Adapter 레이어
│   └── repositories/
│       └── todo.repository.ts      # LocalTodoRepository implements ITodoRepository
│
├── infrastructure/                 # 인프라 설정
│   └── storage/
│       └── local-storage.ts        # LocalStorageService
│
└── presentation/                   # UI 레이어 (React + Tailwind)
    ├── pages/                      # 페이지 (폴더 구조 = 라우트)
    │   └── todos/
    │       ├── TodoListPage.tsx    # /
    │       └── [id]/
    │           └── TodoDetailPage.tsx  # /todos/:id
    ├── routes/
    │   ├── route-paths.ts          # 타입 안전한 경로 정의
    │   └── router.tsx              # React Router 설정
    ├── components/
    │   ├── TodoItem.tsx
    │   └── TodoForm.tsx
    └── hooks/
        ├── use-route-params.ts     # 타입 안전한 params
        ├── use-navigation.ts       # 타입 안전한 navigation
        ├── use-todos.ts
        └── use-todo.ts
```

## 레이어별 상세

### Core Layer (순수 TypeScript)

#### Entities
```typescript
// core/entities/todo.entity.ts
export type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}
```

#### Ports (Hexagonal Architecture)
```typescript
// core/ports/todo.repository.port.ts
export interface ITodoRepository {
  getTodos(): Promise<Todo[]>
  getTodoById(id: string): Promise<Todo | null>
  createTodo(todo: Todo): Promise<Todo>
  updateTodo(todo: Todo): Promise<Todo>
  deleteTodo(id: string): Promise<void>
}
```

#### Use Cases
```typescript
// core/use-cases/create-todo.use-case.ts
import type { Todo } from '@/core/entities/todo.entity'
import { TodoValidationError } from '@/core/errors/todo.error'
import { todoRepository } from '@/data/repositories/todo.repository'

export async function createTodoUseCase(title: string): Promise<Todo> {
  if (!title.trim()) {
    throw new TodoValidationError('Todo title cannot be empty')
  }

  const newTodo: Todo = {
    id: crypto.randomUUID(),
    title: title.trim(),
    completed: false,
    createdAt: new Date(),
  }

  return await todoRepository.createTodo(newTodo)
}
```

### Data Layer (Adapters)

#### Repository Implementation
```typescript
// data/repositories/todo.repository.ts
import type { Todo } from '@/core/entities/todo.entity'
import type { ITodoRepository } from '@/core/ports/todo.repository.port'
import { localStorageService } from '@/infrastructure/storage/local-storage'

class LocalTodoRepository implements ITodoRepository {
  async getTodos(): Promise<Todo[]> {
    const stored = localStorageService.getItem<Todo[]>('todos')
    if (!stored) return []

    // Date 복원
    return stored.map(todo => ({
      ...todo,
      createdAt: new Date(todo.createdAt)
    }))
  }

  async createTodo(todo: Todo): Promise<Todo> {
    const todos = await this.getTodos()
    localStorageService.setItem('todos', [...todos, todo])
    return todo
  }

  // ... 기타 메서드
}

export const todoRepository: ITodoRepository = new LocalTodoRepository()
```

**핵심**:
- ❌ DTO, Mapper, Sources 분리 불필요 (과도한 추상화)
- ✅ LocalStorage만 사용한다면 Repository에서 직접 처리
- ✅ 나중에 API로 바꾸려면 `ApiTodoRepository` 추가

### Infrastructure Layer

```typescript
// infrastructure/storage/local-storage.ts
export class LocalStorageService {
  getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  }

  setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

export const localStorageService = new LocalStorageService()
```

### Presentation Layer

#### 타입 안전한 라우팅

```typescript
// presentation/routes/route-paths.ts
export type RouteParams = {
  'todos/:id': { id: string }
}

export const ROUTE_PATHS = {
  TODOS: {
    LIST: '/',
    DETAIL: (id: string) => `/todos/${id}` as const,
  },
} as const

export type RouteKey = keyof RouteParams
```

```typescript
// presentation/hooks/use-route-params.ts
export function useRouteParams<T extends RouteKey>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _route: T
): RouteParams[T] {
  const params = useParams()
  return params as RouteParams[T]
}
```

```typescript
// presentation/hooks/use-navigation.ts
export function useNavigation() {
  const navigate = useNavigate()

  return {
    goToTodoList: () => navigate(ROUTE_PATHS.TODOS.LIST),
    goToTodoDetail: (id: string) => navigate(ROUTE_PATHS.TODOS.DETAIL(id)),
  }
}
```

#### 페이지 컴포넌트
```typescript
// presentation/pages/todos/[id]/TodoDetailPage.tsx
export function TodoDetailPage() {
  const { id } = useRouteParams('todos/:id')  // ✅ 타입 안전
  const { todo, isLoading, error } = useTodo(id)
  const { goToTodoList } = useNavigation()

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button onClick={goToTodoList}>← Back</button>
      {/* ... */}
    </div>
  )
}
```

## 의존성 규칙

```
Core (순수 TS)
  ↑
Data (Core Port 구현)
  ↑
Presentation (Use Case 호출)
```

**ESLint로 강제:**
```json
{
  "files": ["src/core/**/*.ts"],
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          "@/presentation/*",
          "@/data/*",
          "@/infrastructure/*"
        ]
      }
    ]
  }
}
```

## 베스트 프랙티스

### 1. 과도한 추상화 피하기
❌ **Bad** (너무 복잡):
```
data/
├── models/todo.model.ts      # TodoDto
├── mappers/todo.mapper.ts    # DTO ↔ Entity 변환
├── sources/local/todo-storage.ts
└── repositories/todo.repository.ts
```

✅ **Good** (간단명료):
```
data/
└── repositories/
    └── todo.repository.ts    # LocalStorage 직접 사용
```

### 2. 순수한 도메인 로직
```typescript
// ✅ Good: 순수 함수
export function createTodoUseCase(title: string): Todo {
  if (!title.trim()) throw new ValidationError()
  return { id: uuid(), title, completed: false, createdAt: new Date() }
}

// ❌ Bad: React에 의존
export function useCreateTodo() {
  const [todos, setTodos] = useState([])
  return useCallback((title) => {
    setTodos([...todos, { id: uuid(), title }])
  }, [todos])
}
```

### 3. 타입 안전성
```typescript
// ✅ type으로 export (verbatimModuleSyntax 호환)
export type Todo = { ... }

// ❌ interface는 type-only import 필요
export interface Todo { ... }
```

## 확장 시나리오

### LocalStorage → API 마이그레이션
```typescript
// data/repositories/api-todo.repository.ts
class ApiTodoRepository implements ITodoRepository {
  async getTodos(): Promise<Todo[]> {
    const response = await fetch('/api/todos')
    return response.json()
  }
}

// 한 줄만 변경!
export const todoRepository: ITodoRepository = new ApiTodoRepository()
```

## TypeScript 설정

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/core/*": ["./src/core/*"],
      "@/data/*": ["./src/data/*"],
      "@/presentation/*": ["./src/presentation/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"]
    }
  }
}
```

## 스타일링

**Tailwind CSS 권장**:
- ✅ Inline styles 없음
- ✅ 타입 안전
- ✅ 접근성 (aria-label)

```tsx
<button
  onClick={onClick}
  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  aria-label="Add todo"
>
  Add
</button>
```

## 실전 체크리스트

- [ ] Core는 순수 TypeScript (React 의존성 0)
- [ ] Repository 인터페이스는 `core/ports`에 위치
- [ ] Repository 구현체는 `data/repositories`에 위치
- [ ] Use Case는 순수 함수
- [ ] Presentation은 Use Case만 호출 (Repository 직접 접근 금지)
- [ ] 타입 안전한 라우팅 (useRouteParams, useNavigation)
- [ ] ESLint로 아키텍처 규칙 강제
- [ ] Tailwind CSS (inline styles 금지)
- [ ] 접근성 (aria-label 추가)

## 요약

| 레이어 | 역할 | 의존성 | 예시 |
|--------|------|--------|------|
| **Core** | 비즈니스 로직 | 없음 (순수 TS) | entities, ports, use-cases |
| **Data** | Adapter 구현 | Core Ports | LocalTodoRepository |
| **Infrastructure** | 설정 | 없음 | LocalStorageService |
| **Presentation** | UI | Core Use Cases | pages, components, hooks |

**핵심**: Core를 순수하게 유지하고, UI/라이브러리는 언제든 교체 가능하게!
