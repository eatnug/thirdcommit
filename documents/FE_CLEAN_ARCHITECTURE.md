# Clean Architecture for Frontend Projects

This document describes a clean architecture pattern for frontend applications (React, Next.js, etc.) inspired by MVVM, Android, and Flutter architecture patterns.

## Table of Contents

- [Overview](#overview)
- [Architecture Principles](#architecture-principles)
- [Layer Structure](#layer-structure)
- [Dependency Rules](#dependency-rules)
- [Folder Structure](#folder-structure)
- [Implementation Guidelines](#implementation-guidelines)
- [ESLint Architecture Rules](#eslint-architecture-rules)
- [Common Patterns](#common-patterns)
- [FAQ](#faq)

## Overview

This architecture separates code into distinct layers with clear responsibilities and dependencies. The goal is to create flexible, scalable, and maintainable code by:

- Separating business logic from UI
- Isolating data sources from business logic
- Making the codebase testable
- Enforcing architectural boundaries at build time

## Architecture Principles

1. **Separation of Concerns**: Each layer has a single, well-defined responsibility
2. **Dependency Inversion**: Inner layers don't depend on outer layers
3. **Testability**: Business logic can be tested without UI or external dependencies
4. **Flexibility**: Data sources and UI can be changed without affecting business logic
5. **Scalability**: New features follow established patterns

## Layer Structure

```
src/
├── core/               # Domain Layer (Business Logic)
│   ├── entities/       # Domain models
│   ├── use-cases/      # Business logic
│   └── errors/         # Domain-specific errors
│
├── data/               # Data Layer
│   ├── models/         # DTOs (Data Transfer Objects)
│   ├── mappers/        # DTO ↔ Entity conversion
│   ├── repositories/   # Data access abstraction
│   └── sources/        # Actual data sources
│       ├── local/      # Local storage, file system, etc.
│       └── remote/     # API clients
│
├── presentation/       # Presentation Layer (UI)
│   ├── components/     # React components
│   └── hooks/          # React hooks (state, queries, utilities)
│       └── queries/    # Data fetching hooks (React Query, SWR, etc.)
│
├── shared/             # Shared Utilities
│   ├── services/       # Shared services (not domain-specific)
│   └── utils/          # Utility functions
│
└── infrastructure/     # Infrastructure Configuration
    ├── query-client/   # React Query configuration
    ├── http/           # HTTP client configuration
    └── storage/        # Storage configuration
```

## Dependency Rules

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│   (components, hooks, queries)          │
└────────────────┬────────────────────────┘
                 │ depends on
                 ▼
┌─────────────────────────────────────────┐
│         Core Layer (Domain)             │
│   (entities, use-cases, errors)         │
└────────────────┬────────────────────────┘
                 │ depends on
                 ▼
┌─────────────────────────────────────────┐
│         Data Layer                      │
│   (repositories, models, sources)       │
└─────────────────────────────────────────┘

        ┌─────────────────────┐
        │   Infrastructure    │
        │   Shared/Utils      │
        └─────────────────────┘
        (can be used by any layer)
```

**Rules:**
- **Core (Domain)**:
  - Entities: Can only import from other entities and errors
  - Use Cases: Can import from entities, errors, and data repositories
  - Errors: No imports from other layers
- **Data**: Can import from core entities and errors
- **Presentation**: Can import from core (use-cases, entities) and infrastructure
- **Infrastructure & Shared**: Can be imported by any layer

## Folder Structure

### Core Layer

#### `core/entities/`
Domain models representing business concepts. Pure TypeScript interfaces/types with no dependencies.

```typescript
// core/entities/user.entity.ts
export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}
```

#### `core/use-cases/`
Business logic functions. Each use case does one thing and coordinates between repositories.

```typescript
// core/use-cases/get-users.use-case.ts
import { User } from '@/core/entities/user.entity'
import { userRepository } from '@/data/repositories/user.repository'

export async function getUsersUseCase(): Promise<User[]> {
  return await userRepository.getUsers()
}
```

#### `core/errors/`
Domain-specific error classes.

```typescript
// core/errors/user.error.ts
export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with id "${userId}" not found`)
    this.name = 'UserNotFoundError'
  }
}
```

### Data Layer

#### `data/models/`
DTOs matching API responses or data source formats.

```typescript
// data/models/user.model.ts
export interface UserDto {
  id: string
  email: string
  full_name: string  // Note: different from domain entity
  created_at: string // Note: string, not Date
}
```

#### `data/mappers/`
Convert between DTOs and domain entities.

```typescript
// data/mappers/user.mapper.ts
import { User } from '@/core/entities/user.entity'
import { UserDto } from '@/data/models/user.model'

export class UserMapper {
  static toDomain(dto: UserDto): User {
    return {
      id: dto.id,
      email: dto.email,
      name: dto.full_name,
      createdAt: new Date(dto.created_at),
    }
  }

  static toDomainList(dtos: UserDto[]): User[] {
    return dtos.map(this.toDomain)
  }
}
```

#### `data/repositories/`
Abstract data access. Implements repository interfaces and uses data sources.

```typescript
// data/repositories/user.repository.ts
import { User } from '@/core/entities/user.entity'
import { UserMapper } from '@/data/mappers/user.mapper'

export interface IUserRepository {
  getUsers(): Promise<User[]>
  getUserById(id: string): Promise<User | null>
}

class UserRepository implements IUserRepository {
  async getUsers(): Promise<User[]> {
    // Dynamic import for server-only code (Next.js)
    const { userApi } = await import('@/data/sources/remote/user.api')
    const dtos = await userApi.fetchUsers()
    return UserMapper.toDomainList(dtos)
  }

  async getUserById(id: string): Promise<User | null> {
    const { userApi } = await import('@/data/sources/remote/user.api')
    const dto = await userApi.fetchUserById(id)
    return dto ? UserMapper.toDomain(dto) : null
  }
}

export const userRepository = new UserRepository()
```

#### `data/sources/local/` & `data/sources/remote/`
Actual implementation of data fetching.

```typescript
// data/sources/remote/user.api.ts
import { UserDto } from '@/data/models/user.model'
import { httpClient } from '@/infrastructure/http/client'

export class UserApi {
  async fetchUsers(): Promise<UserDto[]> {
    const response = await httpClient.get<UserDto[]>('/users')
    return response.data
  }

  async fetchUserById(id: string): Promise<UserDto | null> {
    try {
      const response = await httpClient.get<UserDto>(`/users/${id}`)
      return response.data
    } catch {
      return null
    }
  }
}

export const userApi = new UserApi()
```

### Presentation Layer

#### `presentation/components/`
React components. Import from use-cases, entities, and hooks.

```typescript
// presentation/components/user/user-list.tsx
'use client'

import { useUsers } from '@/presentation/hooks/queries/use-users'
import { UserCard } from './user-card'

export function UserList() {
  const { data: users, isLoading } = useUsers()

  if (isLoading) return <div>Loading...</div>
  if (!users) return <div>No users found</div>

  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
```

#### `presentation/hooks/`
React hooks for state management, side effects, and utilities.

```typescript
// presentation/hooks/use-local-storage.ts
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}
```

#### `presentation/hooks/queries/`
Data fetching hooks using React Query, SWR, or similar.

```typescript
// presentation/hooks/queries/use-users.ts
import { useQuery } from '@tanstack/react-query'
import { getUsersUseCase } from '@/core/use-cases/get-users.use-case'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsersUseCase,
  })
}
```

### Infrastructure Layer

#### `infrastructure/query-client/`
React Query configuration and provider.

```typescript
// infrastructure/query-client/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

```typescript
// infrastructure/query-client/query-provider.tsx
'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './query-client'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

#### `infrastructure/http/`
HTTP client configuration (axios, fetch wrapper, etc.).

```typescript
// infrastructure/http/client.ts
import axios from 'axios'

export const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add interceptors for auth, error handling, etc.
httpClient.interceptors.response.use(
  response => response,
  error => {
    // Global error handling
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)
```

### Shared Layer

#### `shared/services/`
Shared services not tied to specific domains.

```typescript
// shared/services/analytics.service.ts
export class AnalyticsService {
  track(event: string, data?: Record<string, unknown>) {
    if (typeof window !== 'undefined') {
      // Track event
    }
  }
}

export const analyticsService = new AnalyticsService()
```

#### `shared/utils/`
Pure utility functions.

```typescript
// shared/utils/date.ts
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US').format(date)
}

// shared/utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Implementation Guidelines

### TypeScript Path Aliases

Configure in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/core/*": ["./src/core/*"],
      "@/data/*": ["./src/data/*"],
      "@/presentation/*": ["./src/presentation/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"]
    }
  }
}
```

### Next.js Configuration

For handling Node.js modules (fs, path) in client bundles:

```typescript
// next.config.ts
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      }
    }
    return config
  },
}

export default nextConfig
```

### Dynamic Imports for Server-Only Code

Use dynamic imports in repositories to avoid bundling server code in client:

```typescript
// In repository
async getUsers(): Promise<User[]> {
  // This prevents fs/path from being bundled in client
  const { userFileSystem } = await import('@/data/sources/local/user-filesystem')
  const dtos = await userFileSystem.getAllUsers()
  return UserMapper.toDomainList(dtos)
}
```

## ESLint Architecture Rules

Create `.eslintrc.architecture.json`:

```json
{
  "overrides": [
    {
      "files": ["src/core/entities/**/*.ts"],
      "rules": {
        "no-restricted-imports": [
          "error",
          {
            "patterns": [
              {
                "group": ["@/presentation/*", "@/data/*", "@/infrastructure/*"],
                "message": "Entities cannot import from presentation, data, or infrastructure layers."
              }
            ]
          }
        ]
      }
    },
    {
      "files": ["src/core/use-cases/**/*.ts"],
      "rules": {
        "no-restricted-imports": [
          "error",
          {
            "patterns": [
              {
                "group": ["@/presentation/*", "@/infrastructure/*"],
                "message": "Use cases cannot import from presentation or infrastructure layers."
              }
            ]
          }
        ]
      }
    },
    {
      "files": ["src/core/errors/**/*.ts"],
      "rules": {
        "no-restricted-imports": [
          "error",
          {
            "patterns": [
              {
                "group": ["@/presentation/*", "@/data/*", "@/infrastructure/*"],
                "message": "Errors cannot import from other layers."
              }
            ]
          }
        ]
      }
    },
    {
      "files": ["src/data/**/*.ts"],
      "rules": {
        "no-restricted-imports": [
          "error",
          {
            "patterns": [
              {
                "group": ["@/presentation/*"],
                "message": "Data layer cannot import from presentation layer."
              }
            ]
          }
        ]
      }
    },
    {
      "files": ["src/presentation/**/*.{ts,tsx}"],
      "rules": {
        "no-restricted-imports": [
          "error",
          {
            "patterns": [
              {
                "group": ["@/data/sources/*", "@/data/models/*", "@/data/mappers/*"],
                "message": "Presentation layer should use use-cases, not data sources directly."
              }
            ]
          }
        ]
      }
    }
  ]
}
```

Include in main `.eslintrc.json`:

```json
{
  "extends": [
    "next/core-web-vitals",
    "./.eslintrc.architecture.json"
  ]
}
```

## Common Patterns

### Pattern 1: Adding a New Feature

1. **Define Entity** (`core/entities/feature.entity.ts`)
2. **Create DTO** (`data/models/feature.model.ts`)
3. **Create Mapper** (`data/mappers/feature.mapper.ts`)
4. **Create Data Source** (`data/sources/remote/feature.api.ts`)
5. **Create Repository** (`data/repositories/feature.repository.ts`)
6. **Create Use Case** (`core/use-cases/get-feature.use-case.ts`)
7. **Create Query Hook** (`presentation/hooks/queries/use-feature.ts`)
8. **Create Component** (`presentation/components/feature/feature-list.tsx`)

### Pattern 2: Handling Errors

```typescript
// core/errors/feature.error.ts
export class FeatureNotFoundError extends Error {
  constructor(id: string) {
    super(`Feature with id "${id}" not found`)
    this.name = 'FeatureNotFoundError'
  }
}

// core/use-cases/get-feature.use-case.ts
import { FeatureNotFoundError } from '@/core/errors/feature.error'

export async function getFeatureUseCase(id: string) {
  const feature = await featureRepository.getById(id)
  if (!feature) throw new FeatureNotFoundError(id)
  return feature
}

// presentation/components/feature/feature-detail.tsx
export function FeatureDetail({ id }: { id: string }) {
  const { data, error } = useFeature(id)

  if (error instanceof FeatureNotFoundError) {
    return <div>Feature not found</div>
  }

  if (error) return <div>Error loading feature</div>
  if (!data) return <div>Loading...</div>

  return <div>{data.name}</div>
}
```

### Pattern 3: Local + Remote Data

```typescript
// data/repositories/feature.repository.ts
class FeatureRepository {
  async getFeatures(): Promise<Feature[]> {
    // Try local cache first
    const cached = await this.getFromCache()
    if (cached) return cached

    // Fetch from remote
    const { featureApi } = await import('@/data/sources/remote/feature.api')
    const dtos = await featureApi.fetchFeatures()
    const features = FeatureMapper.toDomainList(dtos)

    // Cache results
    await this.saveToCache(features)

    return features
  }

  private async getFromCache() {
    const { featureCache } = await import('@/data/sources/local/feature-cache')
    return featureCache.get()
  }

  private async saveToCache(features: Feature[]) {
    const { featureCache } = await import('@/data/sources/local/feature-cache')
    await featureCache.set(features)
  }
}
```

## FAQ

### Why are hooks and components in the same `presentation/` directory?

Both are part of the presentation layer - they handle UI concerns:
- **Components**: Visual representation and user interaction
- **Hooks**: State management, data fetching, and side effects for UI

They're separated into subdirectories but belong together conceptually. Hooks are not "business logic" - they're presentation logic.

### When should I use a use-case vs calling repository directly?

**Always use use-cases from the presentation layer.** Use-cases can:
- Add business rules (filtering, validation, authorization)
- Coordinate multiple repositories
- Handle complex error scenarios
- Be tested independently of UI

Even if a use-case just calls a repository, it provides a stable API for the UI layer.

### Should utilities go in `shared/` or in a specific layer?

- **Domain-specific logic**: Use-cases (e.g., `calculateUserAge`)
- **Data transformation**: Mappers (e.g., `formatApiDate`)
- **UI utilities**: Shared utils (e.g., `cn`, `formatCurrency`)
- **General utilities**: Shared utils (e.g., `debounce`, `sleep`)

### How do I handle authentication/authorization?

- **Auth state**: Use-case + repository pattern
- **Auth service**: `infrastructure/auth/`
- **Protected routes**: `presentation/components/auth/`
- **Token management**: HTTP client interceptors

Example:
```typescript
// infrastructure/http/client.ts
httpClient.interceptors.request.use(async config => {
  const { authService } = await import('@/infrastructure/auth/auth.service')
  const token = await authService.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### Can I skip layers for simple CRUD operations?

No. Even simple operations benefit from:
- Consistent patterns across the codebase
- Easy testing
- Future extensibility (today's simple CRUD might need business rules tomorrow)
- Type safety across boundaries

### How do I test this architecture?

```typescript
// Unit test for use-case (no UI, no actual API)
describe('getUsersUseCase', () => {
  it('filters out inactive users', async () => {
    const mockRepo = {
      getUsers: jest.fn().mockResolvedValue([
        { id: '1', active: true },
        { id: '2', active: false },
      ])
    }

    const users = await getUsersUseCase()
    expect(users).toHaveLength(1)
  })
})

// Integration test for repository
describe('UserRepository', () => {
  it('maps API response to domain entity', async () => {
    // Mock API response
    const users = await userRepository.getUsers()
    expect(users[0]).toHaveProperty('createdAt')
    expect(users[0].createdAt).toBeInstanceOf(Date)
  })
})

// Component test
describe('UserList', () => {
  it('renders users', () => {
    render(<UserList />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
```

---

## Summary

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Testable business logic
- ✅ Flexible data sources
- ✅ Type-safe boundaries
- ✅ Enforced architectural rules
- ✅ Scalable patterns

Start with this structure for new projects, and adapt as needed for specific requirements.
