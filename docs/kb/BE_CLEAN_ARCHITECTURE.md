# Clean Architecture for Backend Projects

백엔드 클린 아키텍처 가이드 - NestJS + Prisma 기반

## 핵심 원칙

### 1. 헥사고날 아키텍처 (Ports & Adapters)
- **Port (인터페이스)**: `application/ports`에 위치
- **Adapter (구현체)**: `adapters/repositories`에 위치
- Application은 Port에만 의존, 구현체는 교체 가능

### 2. 순수성의 동심원
```
┌─────────────────────────────────────┐
│   Presentation (NestJS Controller) │  ← 가장 자주 변경
│   ┌─────────────────────────────┐   │
│   │   Infrastructure            │   │  ← 라이브러리 의존
│   │   ┌─────────────────────┐   │   │
│   │   │   Core (순수 TS)    │   │   │  ← 거의 변경 없음
│   │   │   - Entities        │   │   │
│   │   │   - Ports           │   │   │
│   │   │   - Use Cases       │   │   │
│   │   └─────────────────────┘   │   │
│   │   Adapters (Repositories)   │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 3. 도메인 로직은 순수하게 유지
- **도메인 로직**: 순수 TypeScript로 작성 (프레임워크 의존성 없음)
- **HTTP Integration**: `presentation/controllers`에서만 NestJS 사용
- **외부 라이브러리**: Infrastructure에 격리

## 프로젝트 구조

### 멀티 도메인 아키텍처
```
api/
├── src/
│   ├── stuff/              # 🎯 Stuff 도메인
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── adapters/
│   │   ├── presentation/
│   │   └── stuff.module.ts
│   ├── my-feed/            # 🎯 My Feed 도메인
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── adapters/
│   │   ├── presentation/
│   │   └── my-feed.module.ts
│   ├── shared/             # 🔧 공유 유틸리티
│   ├── app.module.ts       # Root module
│   └── main.ts             # Entry point
├── prisma/
│   └── schema.prisma       # Multi-schema support
└── package.json
```

**핵심**:
- 각 도메인은 완전히 독립적인 Clean Architecture 구조
- 도메인별 독립 스키마 (stuff → stuff schema, my-feed → my_feed schema)
- 도메인 간 스키마 접근 불가 (강제 격리)

## 도메인별 폴더 구조

```
src/stuff/                          # 🎯 Stuff 도메인
├── domain/                         # 🟦 가장 안쪽 - 순수 비즈니스 개념
│   ├── entities/
│   │   └── todo.entity.ts         # type Todo = { id, title, description?, completed, createdAt, updatedAt }
│   ├── dto/
│   │   ├── create-todo.dto.ts     # type CreateTodoDto = { title, description? }
│   │   └── update-todo.dto.ts     # type UpdateTodoDto = { title?, description?, completed? }
│   ├── validators/
│   │   └── todo.validator.ts      # validateTodo(dto) - 순수 함수
│   └── errors/
│       └── todo.error.ts           # TodoValidationError, TodoNotFoundError
│
├── application/                    # 🟩 Use Cases + Ports
│   ├── use-cases/
│   │   ├── get-todos.use-case.ts
│   │   ├── get-todo-by-id.use-case.ts
│   │   ├── create-todo.use-case.ts
│   │   ├── update-todo.use-case.ts
│   │   ├── toggle-todo.use-case.ts
│   │   └── delete-todo.use-case.ts
│   └── ports/
│       └── todo.repository.port.ts # interface ITodoRepository + DI token
│
├── infrastructure/                 # 🟨 순수 기술 구현 (범용 도구)
│   └── prisma/
│       └── stuff-prisma.client.ts  # Stuff 도메인 전용 Prisma Client
│
├── adapters/                       # 🟧 Ports 구현체
│   └── repositories/
│       └── todo.prisma.repository.ts # Prisma 기반 ITodoRepository 구현
│
├── presentation/                   # 🟥 가장 바깥 - HTTP API
│   ├── controllers/
│   │   └── todo.controller.ts     # GET /api/stuff/todos
│   ├── dto/
│   │   ├── create-todo.http.dto.ts # class-validator 데코레이터
│   │   └── update-todo.http.dto.ts
│   └── filters/
│       └── http-exception.filter.ts
│
└── stuff.module.ts                 # NestJS Module (DI 설정)
```

## 레이어 설명

### 🟦 Domain (가장 순수)
- **역할**: 비즈니스 개념 정의
- **의존성**: 없음
- **특징**: 어떤 프레임워크에도 재사용 가능
- **예시**: `Todo` 엔티티, `CreateTodoDto`, `validateTodo`

### 🟩 Application (비즈니스 로직)
- **역할**: Use Case 실행, Port(인터페이스) 정의
- **의존성**: Domain만
- **특징**: "할 일을 어떻게 처리할지" 정의
- **예시**: `createTodoUseCase`, `ITodoRepository` 인터페이스

### 🟨 Infrastructure (순수 기술)
- **역할**: 도메인 전용 기술 도구 (Prisma Client 등)
- **의존성**: 외부 라이브러리만
- **특징**: 특정 도메인 스키마에만 접근
- **예시**: `StuffPrismaClient` (stuff 스키마만 접근)

### 🟧 Adapters (Ports 구현)
- **역할**: Application Ports를 Infrastructure로 연결
- **의존성**: Application (Ports) + Infrastructure
- **특징**: 도메인 전용 구현체
- **예시**: `TodoPrismaRepository` (ITodoRepository 구현 + Prisma 사용)

### 🟥 Presentation (HTTP API)
- **역할**: HTTP 엔드포인트 제공
- **의존성**: Application (Use Cases) + Domain (DTO, Entities)
- **특징**: FastAPI, Express 등으로 교체 가능
- **예시**: `TodoController`, HTTP DTO (class-validator)

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
- **Infrastructure**: 도메인별 독립 (스키마 격리)
- **Adapters**: Application (Ports) + Infrastructure
- **Presentation**: Application + Domain

## 레이어별 상세

### 🟦 Domain Layer

#### Entities
```typescript
// domain/entities/todo.entity.ts
export type Todo = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};
```

#### DTOs (Data Transfer Objects)
```typescript
// domain/dto/create-todo.dto.ts
export type CreateTodoDto = {
  title: string;
  description?: string;
};

// domain/dto/update-todo.dto.ts
export type UpdateTodoDto = {
  title?: string;
  description?: string;
  completed?: boolean;
};
```

**핵심**:
- DTO는 **domain layer**에 정의 (프레임워크 무관)
- Presentation layer의 HTTP DTO와 분리 (관심사 분리)

#### Validators
```typescript
// domain/validators/todo.validator.ts
export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

export function validateTodo(dto: CreateTodoDto): ValidationResult {
  const errors: Record<string, string> = {};

  if (!dto.title || dto.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (dto.title.length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }

  if (dto.description && dto.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
```

**핵심**:
- Validation은 **순수 함수**로 domain에 정의
- 프레임워크에 의존하지 않음 (테스트 용이)
- Use case에서 활용

#### Errors
```typescript
// domain/errors/todo.error.ts
export class TodoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TodoValidationError';
  }
}

export class TodoNotFoundError extends Error {
  constructor(id: string) {
    super(`Todo with id ${id} not found`);
    this.name = 'TodoNotFoundError';
  }
}
```

### 🟩 Application Layer

#### Ports (Hexagonal Architecture)
```typescript
// application/ports/todo.repository.port.ts
import type { Todo } from '@/stuff/domain/entities/todo.entity';
import type { CreateTodoDto } from '@/stuff/domain/dto/create-todo.dto';
import type { UpdateTodoDto } from '@/stuff/domain/dto/update-todo.dto';

export interface ITodoRepository {
  findAll(): Promise<Todo[]>;
  findById(id: string): Promise<Todo | null>;
  create(data: CreateTodoDto): Promise<Todo>;
  update(id: string, data: UpdateTodoDto): Promise<Todo>;
  delete(id: string): Promise<void>;
}

/**
 * Dependency Injection Token
 * NestJS가 인터페이스를 인식하지 못하므로 Symbol 사용
 */
export const TODO_REPOSITORY = Symbol('TODO_REPOSITORY');
```

**핵심**:
- Port는 인터페이스만 정의 (구현체 없음)
- DI Token으로 Symbol 사용 (NestJS 권장 패턴)

#### Use Cases (순수 함수 + DI)
```typescript
// application/use-cases/create-todo.use-case.ts
import type { Todo } from '@/stuff/domain/entities/todo.entity';
import type { CreateTodoDto } from '@/stuff/domain/dto/create-todo.dto';
import type { ITodoRepository } from '@/stuff/application/ports/todo.repository.port';
import { validateTodo } from '@/stuff/domain/validators/todo.validator';
import { TodoValidationError } from '@/stuff/domain/errors/todo.error';

export async function createTodoUseCase(
  repository: ITodoRepository,
  dto: CreateTodoDto,
): Promise<Todo> {
  // 1. Validation
  const validation = validateTodo(dto);
  if (!validation.isValid) {
    const errorMessage = Object.values(validation.errors).join(', ');
    throw new TodoValidationError(errorMessage);
  }

  // 2. Business logic - 데이터 정제
  const todoData: CreateTodoDto = {
    title: dto.title.trim(),
    description: dto.description?.trim(),
  };

  // 3. Persistence
  return await repository.create(todoData);
}
```

**핵심**:
- Use case는 **순수 함수** (NestJS 의존성 없음)
- Repository를 **매개변수로 주입받음** → 테스트 용이
- 비즈니스 로직에 집중

### 🟨 Infrastructure Layer

#### 도메인 전용 Prisma Client
```typescript
// infrastructure/prisma/stuff-prisma.client.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class StuffPrismaClient implements OnModuleInit, OnModuleDestroy {
  private prisma = new PrismaClient();

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  /**
   * Stuff 스키마만 노출
   */
  get stuff() {
    return this.prisma.stuff;
  }

  /**
   * 트랜잭션이 필요한 경우 사용
   */
  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma);
  }
}
```

**핵심**:
- 도메인별 Prisma Client 분리 (스키마 격리)
- `StuffPrismaClient`는 stuff 스키마만 접근
- `MyFeedPrismaClient`는 my_feed 스키마만 접근
- 다른 도메인 스키마 접근 불가 (컴파일 타임 보장)

#### Prisma Schema (Multi-Schema)
```prisma
// prisma/schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["my_feed", "stuff"]
}

// Stuff Domain
model Stuff {
  id          String   @id @default(uuid())
  title       String
  description String?
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("todos")
  @@schema("stuff")
}

// My Feed Domain
model MyFeed {
  id          String   @id @default(uuid())
  title       String
  description String?
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("feeds")
  @@schema("my_feed")
}
```

### 🟧 Adapters Layer

#### Repository Implementation
```typescript
// adapters/repositories/todo.prisma.repository.ts
import { Injectable } from '@nestjs/common';
import type { Todo } from '@/stuff/domain/entities/todo.entity';
import type { CreateTodoDto } from '@/stuff/domain/dto/create-todo.dto';
import type { UpdateTodoDto } from '@/stuff/domain/dto/update-todo.dto';
import type { ITodoRepository } from '@/stuff/application/ports/todo.repository.port';
import { StuffPrismaClient } from '@/stuff/infrastructure/prisma/stuff-prisma.client';

@Injectable()
export class TodoPrismaRepository implements ITodoRepository {
  constructor(private readonly prisma: StuffPrismaClient) {}

  async findAll(): Promise<Todo[]> {
    const todos = await this.prisma.stuff.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return todos.map(this.mapToTodo);
  }

  async findById(id: string): Promise<Todo | null> {
    const todo = await this.prisma.stuff.findUnique({
      where: { id },
    });
    return todo ? this.mapToTodo(todo) : null;
  }

  async create(data: CreateTodoDto): Promise<Todo> {
    const todo = await this.prisma.stuff.create({
      data,
    });
    return this.mapToTodo(todo);
  }

  async update(id: string, data: UpdateTodoDto): Promise<Todo> {
    const todo = await this.prisma.stuff.update({
      where: { id },
      data,
    });
    return this.mapToTodo(todo);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.stuff.delete({
      where: { id },
    });
  }

  /**
   * Prisma model → Domain entity 변환
   */
  private mapToTodo(prismaModel: any): Todo {
    return {
      id: prismaModel.id,
      title: prismaModel.title,
      description: prismaModel.description ?? undefined,
      completed: prismaModel.completed,
      createdAt: prismaModel.createdAt,
      updatedAt: prismaModel.updatedAt,
    };
  }
}
```

**핵심**:
- Application Port 구현 + Infrastructure 사용
- Prisma model → Domain entity 변환 담당
- `null` → `undefined` 변환 (도메인 타입 일치)

### 🟥 Presentation Layer

#### HTTP DTO (class-validator)
```typescript
// presentation/dto/create-todo.http.dto.ts
import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import type { CreateTodoDto } from '@/stuff/domain/dto/create-todo.dto';

export class CreateTodoHttpDto implements CreateTodoDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  @MaxLength(100, { message: 'Title must be less than 100 characters' })
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must be less than 500 characters' })
  description?: string;
}
```

**핵심**:
- Presentation layer 전용 DTO (class-validator 데코레이터)
- Domain DTO와 분리 (관심사 분리)
- Domain DTO를 `implements`하여 타입 일치 보장

#### Controller
```typescript
// presentation/controllers/todo.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  HttpCode,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { CreateTodoHttpDto } from '@/stuff/presentation/dto/create-todo.http.dto';
import { UpdateTodoHttpDto } from '@/stuff/presentation/dto/update-todo.http.dto';
import { TodoHttpExceptionFilter } from '@/stuff/presentation/filters/http-exception.filter';
import { TODO_REPOSITORY } from '@/stuff/application/ports/todo.repository.port';
import type { ITodoRepository } from '@/stuff/application/ports/todo.repository.port';
import { getTodosUseCase } from '@/stuff/application/use-cases/get-todos.use-case';
import { createTodoUseCase } from '@/stuff/application/use-cases/create-todo.use-case';
import { updateTodoUseCase } from '@/stuff/application/use-cases/update-todo.use-case';
import { toggleTodoUseCase } from '@/stuff/application/use-cases/toggle-todo.use-case';
import { deleteTodoUseCase } from '@/stuff/application/use-cases/delete-todo.use-case';

@Controller('api/stuff/todos')
@UseFilters(TodoHttpExceptionFilter)
export class TodoController {
  constructor(
    @Inject(TODO_REPOSITORY)
    private readonly todoRepository: ITodoRepository,
  ) {}

  @Get()
  async findAll() {
    return await getTodosUseCase(this.todoRepository);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await getTodoByIdUseCase(this.todoRepository, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTodoHttpDto) {
    return await createTodoUseCase(this.todoRepository, dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTodoHttpDto) {
    return await updateTodoUseCase(this.todoRepository, id, dto);
  }

  @Put(':id/toggle')
  async toggle(@Param('id') id: string) {
    return await toggleTodoUseCase(this.todoRepository, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await deleteTodoUseCase(this.todoRepository, id);
  }
}
```

**핵심**:
- HTTP 엔드포인트만 정의
- Use case에 위임 (비즈니스 로직 없음)
- Repository를 DI로 주입받아 use case에 전달

#### NestJS Module (DI 설정)
```typescript
// stuff.module.ts
import { Module } from '@nestjs/common';
import { TodoController } from '@/stuff/presentation/controllers/todo.controller';
import { TodoPrismaRepository } from '@/stuff/adapters/repositories/todo.prisma.repository';
import { TODO_REPOSITORY } from '@/stuff/application/ports/todo.repository.port';
import { StuffPrismaClient } from '@/stuff/infrastructure/prisma/stuff-prisma.client';

@Module({
  imports: [],
  controllers: [TodoController],
  providers: [
    StuffPrismaClient,
    {
      provide: TODO_REPOSITORY,
      useClass: TodoPrismaRepository,
    },
  ],
  exports: [TODO_REPOSITORY],
})
export class StuffModule {}
```

**핵심**:
- 도메인 전용 Prisma Client 제공
- Repository 구현체를 Port에 바인딩
- NestJS DI Container가 의존성 관리

## 베스트 프랙티스

### 1. 도메인별 스키마 격리
```typescript
// ✅ Good: 도메인별 Prisma Client 분리
class StuffPrismaClient {
  get stuff() {
    return this.prisma.stuff;  // stuff 스키마만 접근
  }
}

class MyFeedPrismaClient {
  get myFeed() {
    return this.prisma.myFeed;  // my_feed 스키마만 접근
  }
}

// ❌ Bad: 전역 Prisma Client (모든 스키마 접근 가능)
const prisma = new PrismaClient();
prisma.stuff.findMany();   // stuff 도메인에서
prisma.myFeed.findMany();  // my_feed도 접근 가능 (격리 실패)
```

### 2. 순수한 Use Case (DI)
```typescript
// ✅ Good: 순수 함수 + DI
export async function createTodoUseCase(
  repository: ITodoRepository,  // 매개변수로 주입
  dto: CreateTodoDto
): Promise<Todo> {
  const validation = validateTodo(dto);
  if (!validation.isValid) throw new ValidationError();
  return await repository.create(dto);
}

// ❌ Bad: 프레임워크에 의존
@Injectable()
export class CreateTodoUseCase {
  constructor(
    @Inject(TODO_REPOSITORY) private repo: ITodoRepository
  ) {}

  async execute(dto: CreateTodoDto) {
    return await this.repo.create(dto);
  }
}
```

### 3. HTTP DTO vs Domain DTO 분리
```typescript
// ✅ Good: 관심사 분리
// domain/dto/create-todo.dto.ts (순수 타입)
export type CreateTodoDto = {
  title: string;
  description?: string;
};

// presentation/dto/create-todo.http.dto.ts (class-validator)
export class CreateTodoHttpDto implements CreateTodoDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  description?: string;
}

// ❌ Bad: Domain에 프레임워크 의존성
export class CreateTodoDto {
  @IsString()  // 프레임워크 데코레이터
  title!: string;
}
```

### 4. Validation 위치
```typescript
// ✅ Good: Domain validator (순수 함수) + HTTP DTO (class-validator)
// domain/validators/todo.validator.ts
export function validateTodo(dto: CreateTodoDto): ValidationResult {
  // 순수 함수 validation (비즈니스 로직)
}

// presentation/dto/create-todo.http.dto.ts
export class CreateTodoHttpDto {
  @IsString()
  @MinLength(1)
  title!: string;  // HTTP layer validation (형식 검증)
}

// ❌ Bad: Use case에서만 validation
export async function createTodoUseCase(repo, dto) {
  if (!dto.title) throw new Error();  // 순수 함수 아님
}
```

## 확장 시나리오

### Prisma → TypeORM 마이그레이션

**1. Infrastructure Layer에 TypeORM Client 추가**
```typescript
// infrastructure/typeorm/stuff-typeorm.client.ts
@Injectable()
export class StuffTypeOrmClient {
  constructor(
    @InjectRepository(TodoEntity)
    private readonly todoRepository: Repository<TodoEntity>
  ) {}

  get todos() {
    return this.todoRepository;
  }
}
```

**2. Adapters Layer에 TypeORM Repository 추가**
```typescript
// adapters/repositories/todo.typeorm.repository.ts
@Injectable()
export class TodoTypeOrmRepository implements ITodoRepository {
  constructor(private readonly orm: StuffTypeOrmClient) {}

  async findAll(): Promise<Todo[]> {
    const entities = await this.orm.todos.find();
    return entities.map(this.mapToTodo);
  }

  // ... 나머지 메서드
}
```

**3. Module에서 교체**
```typescript
// stuff.module.ts
@Module({
  providers: [
    StuffTypeOrmClient,  // TypeORM으로 교체
    {
      provide: TODO_REPOSITORY,
      useClass: TodoTypeOrmRepository,  // 구현체만 교체
    },
  ],
})
export class StuffModule {}
```

**핵심**: Application layer (Use case, Port) 수정 없음!

### 새 도메인 추가

**1. 도메인 폴더 생성**
```
src/
├── user/                  # 🆕 새 도메인
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   ├── adapters/
│   ├── presentation/
│   └── user.module.ts
```

**2. Prisma Schema 추가**
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
  @@schema("user")  // 독립 스키마
}
```

**3. App Module에 등록**
```typescript
@Module({
  imports: [StuffModule, MyFeedModule, UserModule],  // 추가
})
export class AppModule {}
```

## NestJS 특화 패턴

### 1. DI Token (Symbol 사용)
```typescript
// Port 정의 시 Symbol 기반 Token 제공
export const TODO_REPOSITORY = Symbol('TODO_REPOSITORY');

// Module에서 바인딩
providers: [
  {
    provide: TODO_REPOSITORY,
    useClass: TodoPrismaRepository,
  },
]

// Controller에서 주입
constructor(
  @Inject(TODO_REPOSITORY)
  private readonly repo: ITodoRepository
) {}
```

### 2. Exception Filter
```typescript
// presentation/filters/http-exception.filter.ts
@Catch()
export class TodoHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof TodoNotFoundError) {
      response.status(404).json({
        statusCode: 404,
        message: exception.message,
      });
    } else if (exception instanceof TodoValidationError) {
      response.status(400).json({
        statusCode: 400,
        message: exception.message,
      });
    } else {
      response.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
      });
    }
  }
}
```

### 3. Global Validation Pipe
```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,      // DTO에 없는 속성 제거
    transform: true,      // 타입 자동 변환
  }),
);
```

## TypeScript 설정

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/stuff/*": ["./src/stuff/*"],
      "@/my-feed/*": ["./src/my-feed/*"],
      "@/shared/*": ["./src/shared/*"]
    }
  }
}
```

## 실전 체크리스트

### 🟦 Domain Layer
- [ ] Entities는 순수 타입 정의 (의존성 0)
- [ ] DTO는 domain에 정의 (type 사용)
- [ ] Validators는 순수 함수
- [ ] Custom Errors 정의

### 🟩 Application Layer
- [ ] Use case는 순수 함수 (repository를 매개변수로 받음)
- [ ] Repository 인터페이스(Port)는 `application/ports`에 위치
- [ ] DI Token은 Symbol 사용
- [ ] Domain만 의존

### 🟨 Infrastructure Layer
- [ ] 도메인별 Prisma Client 분리 (스키마 격리)
- [ ] 해당 도메인 스키마만 노출
- [ ] NestJS lifecycle hooks 구현 (onModuleInit, onModuleDestroy)

### 🟧 Adapters Layer
- [ ] Repository 구현체는 `adapters/repositories`에 위치
- [ ] Application Port 구현 + Infrastructure 사용
- [ ] Prisma model → Domain entity 변환 로직 포함

### 🟥 Presentation Layer
- [ ] Controller는 HTTP 엔드포인트만 정의
- [ ] Use case에 위임 (비즈니스 로직 없음)
- [ ] HTTP DTO는 class-validator 사용
- [ ] Exception Filter로 도메인 에러 → HTTP 응답 변환

### Module (DI 설정)
- [ ] 도메인 전용 Prisma Client 제공
- [ ] Repository 구현체를 Port에 바인딩
- [ ] 필요시 Repository export (도메인 간 공유)

## 요약

| 레이어 | 역할 | 의존성 | 예시 |
|--------|------|--------|------|
| 🟦 **Domain** | 비즈니스 개념 | 없음 (순수 TS) | entities, dto, validators, errors |
| 🟩 **Application** | 비즈니스 로직 | Domain만 | use-cases, ports |
| 🟨 **Infrastructure** | 기술 도구 | 외부 라이브러리만 | StuffPrismaClient |
| 🟧 **Adapters** | Port 구현 | Application + Infrastructure | TodoPrismaRepository |
| 🟥 **Presentation** | HTTP API | Application + Domain | controllers, HTTP DTO |

**핵심 패턴**:
1. **Domain**: 아무것도 의존하지 않음 (가장 순수)
2. **Application**: Domain만 의존, Port 인터페이스 정의
3. **Infrastructure**: 도메인별 스키마 격리 (Prisma Client 분리)
4. **Adapters**: Application Port 구현 + Infrastructure 사용
5. **Use case는 순수 함수** → repository를 매개변수로 주입
6. **Controller에서 DI** → NestJS가 repository 주입 → use case에 전달
7. **스키마 격리** → 도메인 간 데이터 접근 불가 (컴파일 타임 보장)

**의존성 흐름**:
```
         Presentation (Controller)
              ↓
         Application (Use Cases) ← Adapters (Repository)
              ↓                        ↓
           Domain                Infrastructure (Prisma)

NestJS Module → { provide: TODO_REPOSITORY, useClass: TodoPrismaRepository }
  ↓
Controller → @Inject(TODO_REPOSITORY) repository
  ↓
createTodoUseCase(repository, dto)  ✅ 순수 함수
```

**도메인 격리**:
```
StuffModule → StuffPrismaClient → stuff schema only
MyFeedModule → MyFeedPrismaClient → my_feed schema only

✅ 도메인 간 스키마 접근 불가 (컴파일 타임 보장)
```

**핵심**: Domain을 순수하게 유지하고, Infrastructure는 도메인별로 격리하며, 구현체는 언제든 교체 가능하게!
