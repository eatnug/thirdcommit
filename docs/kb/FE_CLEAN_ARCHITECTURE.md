# Clean Architecture for Frontend Projects

프론트엔드 클린 아키텍처 가이드 - React + TypeScript 기반

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
├── domain/                         # 🟦 가장 안쪽 - 순수 비즈니스 개념
│   ├── entities/
│   │   └── todo.entity.ts         # type Todo = { id, title, description?, completed, createdAt }
│   ├── dto/
│   │   └── create-todo.dto.ts     # type CreateTodoDto = { title, description? }
│   ├── validators/
│   │   └── todo-form.validator.ts # validateTodoForm(dto) - 순수 함수
│   └── errors/
│       └── todo.error.ts          # TodoValidationError, TodoNotFoundError
│
├── application/                    # 🟩 Use Cases + Ports + DI
│   ├── use-cases/
│   │   ├── get-todos.use-case.ts
│   │   ├── create-todo.use-case.ts
│   │   ├── toggle-todo.use-case.ts
│   │   └── delete-todo.use-case.ts
│   ├── ports/
│   │   └── todo.repository.port.ts # interface ITodoRepository
│   └── di/
│       └── container.ts            # DI Container (singleton)
│
├── infrastructure/                 # 🟨 순수 기술 구현 (범용 도구)
│   ├── storage/
│   │   └── local-storage.ts       # LocalStorageService (범용)
│   ├── http/
│   │   └── api-client.ts          # fetch wrapper (나중에)
│   └── logger/
│       └── console-logger.ts      # ConsoleLogger (나중에)
│
├── adapters/                       # 🟧 Ports 구현체 (Infrastructure 사용)
│   └── repositories/
│       ├── todo.local.repository.ts  # LocalStorage 사용
│       └── todo.api.repository.ts    # API 사용 (나중에)
│
└── presentation/                   # 🟥 가장 바깥 - UI
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
        ├── use-todos.ts            # container에서 repository 주입
        └── use-todo.ts
```

## 레이어 설명

### 🟦 Domain (가장 순수)
- **역할**: 비즈니스 개념 정의
- **의존성**: 없음
- **특징**: 어떤 기술 스택에도 재사용 가능
- **예시**: `Todo` 엔티티, `CreateTodoDto`, `validateTodoForm`

### 🟩 Application (비즈니스 로직)
- **역할**: Use Case 실행, Port(인터페이스) 정의, DI Container
- **의존성**: Domain만
- **특징**: "할 일을 어떻게 처리할지" 정의
- **예시**: `createTodoUseCase`, `ITodoRepository` 인터페이스

### 🟨 Infrastructure (순수 기술)
- **역할**: 범용 기술 도구 (어떤 도메인에서도 사용 가능)
- **의존성**: 외부 라이브러리만
- **특징**: Todo와 무관하게 재사용 가능
- **예시**: `LocalStorageService`, `ApiClient`, `Logger`

### 🟧 Adapters (Ports 구현)
- **역할**: Application Ports를 Infrastructure로 연결
- **의존성**: Application (Ports) + Infrastructure
- **특징**: Todo 도메인 전용 구현체
- **예시**: `LocalTodoRepository` (ITodoRepository 구현 + LocalStorage 사용)

### 🟥 Presentation (UI)
- **역할**: 사용자 인터페이스
- **의존성**: Application (Use Cases) + Domain (DTO, Entities)
- **특징**: React, Vue 등으로 교체 가능
- **예시**: `TodoForm`, `useTodos`

## 의존성 방향

```
         Presentation
              ↓
         Application ← Adapters
              ↓            ↓
           Domain    Infrastructure
```

**핵심**:
- **Domain**: 아무것도 의존하지 않음
- **Application**: Domain만 의존
- **Infrastructure**: 독립적 (범용 도구)
- **Adapters**: Application (Ports) + Infrastructure
- **Presentation**: Application + Domain

**Infrastructure vs Adapters 차이**:
- `LocalStorageService` (Infrastructure): 범용 - 어떤 앱에서도 사용 가능
- `TodoLocalRepository` (Adapters): Todo 전용 - `ITodoRepository` 구현

## 레이어별 상세

### 🟦 Domain Layer

#### Entities
```typescript
// domain/entities/todo.entity.ts
export type Todo = {
  id: string
  title: string
  description?: string  // 옵셔널 필드
  completed: boolean
  createdAt: Date
}
```

#### DTOs (Data Transfer Objects)
```typescript
// domain/dto/create-todo.dto.ts
export type CreateTodoDto = {
  title: string
  description?: string
}
```

**핵심**:
- DTO는 **domain layer**에 정의 (adapters/presentation 모두 domain에 의존)
- Form 데이터와 API 요청 형식이 다를 때 유용
- 의존성 방향: `presentation → domain ← adapters`

#### Validators
```typescript
// domain/validators/todo-form.validator.ts
import type { CreateTodoDto } from '@/domain/dto/create-todo.dto'

export type ValidationResult = {
  isValid: boolean
  errors: {
    title?: string
    description?: string
  }
}

export function validateTodoForm(data: CreateTodoDto): ValidationResult {
  const errors: { title?: string; description?: string } = {}

  if (!data.title.trim()) {
    errors.title = 'Title is required'
  }

  if (data.title.length > 100) {
    errors.title = 'Title must be less than 100 characters'
  }

  if (data.description && data.description.length > 500) {
    errors.description = 'Description must be less than 500 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
```

**핵심**:
- Validation은 **순수 함수**로 domain에 정의
- presentation에서 실시간 validation 활용 가능
- use case에서도 동일한 validation 재사용

### 🟩 Application Layer

#### Ports (Hexagonal Architecture)
```typescript
// application/ports/todo.repository.port.ts
export interface ITodoRepository {
  getTodos(): Promise<Todo[]>
  getTodoById(id: string): Promise<Todo | null>
  createTodo(todo: Todo): Promise<Todo>
  updateTodo(todo: Todo): Promise<Todo>
  deleteTodo(id: string): Promise<void>
}
```

#### Use Cases (순수 함수 + DI)
```typescript
// application/use-cases/create-todo.use-case.ts
import type { Todo } from '@/domain/entities/todo.entity'
import type { CreateTodoDto } from '@/domain/dto/create-todo.dto'
import type { ITodoRepository } from '@/application/ports/todo.repository.port'
import { TodoValidationError } from '@/domain/errors/todo.error'
import { validateTodoForm } from '@/domain/validators/todo-form.validator'

export async function createTodoUseCase(
  repository: ITodoRepository,  // ✅ Repository를 매개변수로 주입
  dto: CreateTodoDto
): Promise<Todo> {
  const validation = validateTodoForm(dto)

  if (!validation.isValid) {
    const errorMessage = Object.values(validation.errors).join(', ')
    throw new TodoValidationError(errorMessage)
  }

  const newTodo: Todo = {
    id: crypto.randomUUID(),
    title: dto.title.trim(),
    description: dto.description?.trim(),
    completed: false,
    createdAt: new Date(),
  }

  return await repository.createTodo(newTodo)
}
```

**핵심**:
- Use case는 **순수 함수** (DI 컨테이너에 직접 의존 ❌)
- Repository를 **매개변수로 주입받음** → 테스트 용이
- DTO 사용으로 타입 안전성 확보

#### DI Container
```typescript
// application/di/container.ts
import type { ITodoRepository } from '@/application/ports/todo.repository.port'
import { localTodoRepository } from '@/adapters/repositories/todo.local.repository'

/**
 * Simple Dependency Injection Container
 *
 * 나중에 LocalStorage → API로 바꿀 때 이 파일에서 한 줄만 수정하면 됨.
 * 예: localTodoRepository → apiTodoRepository
 */
export const container = {
  todoRepository: localTodoRepository as ITodoRepository
}
```

**핵심**:
- 간단한 객체로 정의 (Singleton 패턴, getter/setter 불필요)
- main.tsx 초기화 불필요
- 나중에 교체할 때 한 줄만 변경

### 🟨 Infrastructure Layer

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

  removeItem(key: string): void {
    localStorage.removeItem(key)
  }
}

export const localStorageService = new LocalStorageService()
```

**핵심**:
- **범용 도구** - Todo와 무관하게 재사용 가능
- User, Product 등 다른 도메인에서도 사용 가능
- 외부 라이브러리 래핑 (localStorage, axios 등)

### 🟧 Adapters Layer

#### Repository Implementation
```typescript
// adapters/repositories/todo.local.repository.ts
import type { Todo } from '@/domain/entities/todo.entity'
import type { ITodoRepository } from '@/application/ports/todo.repository.port'
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

export const localTodoRepository: ITodoRepository = new LocalTodoRepository()
```

**핵심**:
- **Todo 전용** - Application Port 구현 + Infrastructure 사용
- ✅ 파일명: `todo.local.repository.ts` (구현체 구분)
- ✅ 나중에 API로 바꾸려면 `todo.api.repository.ts` 추가
- Infrastructure 도구(`LocalStorageService`)를 사용해서 Port 구현

### 🟥 Presentation Layer

#### Custom Hooks (Repository 주입)

```typescript
// presentation/hooks/use-todos.ts
import { useState, useEffect, useCallback } from 'react'
import type { Todo } from '@/domain/entities/todo.entity'
import type { CreateTodoDto } from '@/domain/dto/create-todo.dto'
import { getTodosUseCase } from '@/application/use-cases/get-todos.use-case'
import { createTodoUseCase } from '@/application/use-cases/create-todo.use-case'
import { container } from '@/application/di/container'

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const repository = container.todoRepository  // ✅ Container에서 repository 가져옴

  const loadTodos = useCallback(async () => {
    try {
      setIsLoading(true)
      const loadedTodos = await getTodosUseCase(repository)  // ✅ 주입
      setTodos(loadedTodos)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [repository])

  const createTodo = useCallback(async (dto: CreateTodoDto) => {
    try {
      await createTodoUseCase(repository, dto)  // ✅ 주입
      await loadTodos()
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [repository, loadTodos])

  return { todos, isLoading, error, createTodo }
}
```

**핵심**:
- Hooks에서 DI container를 통해 repository 가져옴
- Use case에 repository를 **명시적으로 주입**
- Use case는 순수 함수로 유지 (테스트 용이)

#### 폼 컴포넌트 (DTO + Validation)

```typescript
// presentation/components/TodoForm.tsx
import { useState, type FormEvent } from 'react'
import type { CreateTodoDto } from '@/domain/dto/create-todo.dto'
import { validateTodoForm } from '@/domain/validators/todo-form.validator'

interface TodoFormProps {
  onSubmit: (dto: CreateTodoDto) => Promise<void>
}

export function TodoForm({ onSubmit }: TodoFormProps) {
  const [formData, setFormData] = useState<CreateTodoDto>({
    title: '',
    description: '',
  })

  const validation = validateTodoForm(formData)  // ✅ 실시간 validation

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validation.isValid) return

    await onSubmit({
      title: formData.title,
      description: formData.description || undefined,
    })
    setFormData({ title: '', description: '' })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Title"
      />
      {validation.errors.title && (
        <span className="text-red-500">{validation.errors.title}</span>
      )}

      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Description (optional)"
      />
      {validation.errors.description && (
        <span className="text-red-500">{validation.errors.description}</span>
      )}

      <button type="submit" disabled={!validation.isValid}>
        Add
      </button>
    </form>
  )
}
```

**핵심**:
- DTO를 Form 상태로 사용
- Core의 validator로 실시간 검증
- 에러 메시지 표시로 UX 개선

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

**ESLint로 의존성 강제:**
```json
{
  "files": ["src/domain/**/*.ts"],
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": ["@/application/*", "@/adapters/*", "@/infrastructure/*", "@/presentation/*"],
        "message": "Domain layer must not depend on any other layer"
      }
    ]
  }
},
{
  "files": ["src/application/**/*.ts"],
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": ["@/adapters/*", "@/infrastructure/*", "@/presentation/*"],
        "message": "Application layer can only depend on Domain"
      }
    ]
  }
},
{
  "files": ["src/infrastructure/**/*.ts"],
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": ["@/domain/*", "@/application/*", "@/adapters/*", "@/presentation/*"],
        "message": "Infrastructure must be independent"
      }
    ]
  }
}
```

## 베스트 프랙티스

### 1. 레이어 분리 (Infrastructure vs Adapters)
❌ **Bad** (모호):
```
data/
└── repositories/
    └── todo.repository.ts    # LocalStorage 직접 사용
```

✅ **Good** (명확):
```
infrastructure/
└── storage/
    └── local-storage.ts      # 범용 LocalStorage wrapper

adapters/
└── repositories/
    └── todo.local.repository.ts  # Todo 전용, LocalStorage 사용
```

**차이점**:
- `LocalStorageService`: User, Product 등 어디서나 재사용 가능
- `TodoLocalRepository`: Todo 도메인 전용, ITodoRepository 구현

### 2. 순수한 도메인 로직 (Repository 주입)
```typescript
// ✅ Good: 순수 함수 + DI
export async function createTodoUseCase(
  repository: ITodoRepository,  // 매개변수로 주입
  dto: CreateTodoDto
): Promise<Todo> {
  const validation = validateTodoForm(dto)
  if (!validation.isValid) throw new ValidationError()

  const todo = {
    id: uuid(),
    ...dto,
    completed: false,
    createdAt: new Date()
  }
  return await repository.createTodo(todo)
}

// ❌ Bad: Container에 직접 의존
export async function createTodoUseCase(dto: CreateTodoDto) {
  return await container.todoRepository.createTodo(...)  // 테스트 어려움
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

**1. Infrastructure Layer에 API Client 추가 (범용 도구)**
```typescript
// infrastructure/http/api-client.ts
export class ApiClient {
  constructor(private baseURL: string) {}

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`)
    return response.json()
  }

  async post<T>(path: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }
}

export const apiClient = new ApiClient('/api')
```

**2. Adapters Layer에 API Repository 추가 (Todo 전용)**
```typescript
// adapters/repositories/todo.api.repository.ts
import type { Todo } from '@/domain/entities/todo.entity'
import type { ITodoRepository } from '@/application/ports/todo.repository.port'
import { apiClient } from '@/infrastructure/http/api-client'

class ApiTodoRepository implements ITodoRepository {
  async getTodos(): Promise<Todo[]> {
    return apiClient.get<Todo[]>('/todos')
  }

  async createTodo(todo: Todo): Promise<Todo> {
    return apiClient.post<Todo>('/todos', todo)
  }

  // ... 나머지 메서드
}

export const apiTodoRepository: ITodoRepository = new ApiTodoRepository()
```

**3. DI Container에서 한 줄만 변경!**
```typescript
// application/di/container.ts
// Before
import { localTodoRepository } from '@/adapters/repositories/todo.local.repository'
export const container = {
  todoRepository: localTodoRepository as ITodoRepository
}

// After
import { apiTodoRepository } from '@/adapters/repositories/todo.api.repository'
export const container = {
  todoRepository: apiTodoRepository as ITodoRepository  // 한 줄만 변경!
}
```

**핵심**: main.tsx 수정 불필요, container.ts만 수정

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
      "@/domain/*": ["./src/domain/*"],
      "@/application/*": ["./src/application/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"],
      "@/adapters/*": ["./src/adapters/*"],
      "@/presentation/*": ["./src/presentation/*"]
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

### 🟦 Domain Layer
- [ ] Entities는 순수 타입 정의 (의존성 0)
- [ ] DTO는 domain에 정의
- [ ] Validators는 순수 함수
- [ ] Errors 정의

### 🟩 Application Layer
- [ ] Use Case는 repository를 매개변수로 받는 순수 함수
- [ ] Repository 인터페이스(Port)는 `application/ports`에 위치
- [ ] DI Container는 간단한 객체로 정의
- [ ] Domain만 의존

### 🟨 Infrastructure Layer
- [ ] 범용 기술 도구만 구현 (LocalStorage, HTTP, Logger 등)
- [ ] 도메인과 무관하게 재사용 가능
- [ ] 외부 라이브러리만 의존

### 🟧 Adapters Layer
- [ ] Repository 구현체는 `adapters/repositories`에 위치
- [ ] 파일명: `todo.{구현체}.repository.ts` (예: local, api)
- [ ] Application Port 구현 + Infrastructure 사용

### 🟥 Presentation Layer
- [ ] Hooks에서 container로 repository 가져와서 use case에 주입
- [ ] Form 컴포넌트는 Domain DTO 사용
- [ ] Domain validator로 실시간 검증
- [ ] 타입 안전한 라우팅

### 기타
- [ ] ESLint로 레이어 의존성 강제
- [ ] Tailwind CSS
- [ ] 접근성 (aria-label)

## 요약

| 레이어 | 역할 | 의존성 | 예시 |
|--------|------|--------|------|
| 🟦 **Domain** | 비즈니스 개념 | 없음 (순수 TS) | entities, dto, validators, errors |
| 🟩 **Application** | 비즈니스 로직 | Domain만 | use-cases, ports, di |
| 🟨 **Infrastructure** | 범용 기술 도구 | 외부 라이브러리만 | LocalStorageService, ApiClient |
| 🟧 **Adapters** | Port 구현 | Application + Infrastructure | todo.local.repository, todo.api.repository |
| 🟥 **Presentation** | UI | Application + Domain | pages, components, hooks |

**핵심 패턴**:
1. **Domain**: 아무것도 의존하지 않음 (가장 순수)
2. **Application**: Domain만 의존, Port 인터페이스 정의
3. **Infrastructure**: 독립적, 범용 도구 (Todo와 무관)
4. **Adapters**: Application Port 구현 + Infrastructure 사용
5. **DI Container**: 간단한 객체로 정의 (Singleton 불필요)
6. **Use case는 순수 함수** → repository를 매개변수로 주입
7. **Hooks에서 DI** → container에서 repository 가져와 use case에 주입

**의존성 흐름**:
```
         Presentation
              ↓
         Application ← Adapters
              ↓            ↓
           Domain    Infrastructure

container.ts → { todoRepository: localTodoRepository }  // 한 곳에서만 정의
  ↓
useTodos → repository = container.todoRepository
  ↓
createTodoUseCase(repository, dto)  ✅ 순수 함수
```

**파일 구조 (간결함)**:
```
src/
├── main.tsx              # 단일 엔트리포인트 (App.tsx 불필요)
├── index.css             # Tailwind 설정만
├── domain/               # 비즈니스 개념
├── application/          # 비즈니스 로직
│   └── di/container.ts   # 간단한 객체 (초기화 불필요)
├── infrastructure/       # 범용 도구
├── adapters/            # 구현체
└── presentation/        # UI
```

**핵심**: Domain을 순수하게 유지하고, Infrastructure는 범용적으로, UI/구현체는 언제든 교체 가능하게!
