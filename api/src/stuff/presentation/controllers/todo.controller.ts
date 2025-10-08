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
import { getTodoByIdUseCase } from '@/stuff/application/use-cases/get-todo-by-id.use-case';
import { createTodoUseCase } from '@/stuff/application/use-cases/create-todo.use-case';
import { updateTodoUseCase } from '@/stuff/application/use-cases/update-todo.use-case';
import { toggleTodoUseCase } from '@/stuff/application/use-cases/toggle-todo.use-case';
import { deleteTodoUseCase } from '@/stuff/application/use-cases/delete-todo.use-case';

/**
 * Todo Controller
 *
 * - HTTP 엔드포인트 정의
 * - Use Case에 위임
 * - Repository는 DI로 주입받아 Use Case에 전달
 *
 * Path: /api/stuff/todos
 */
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
