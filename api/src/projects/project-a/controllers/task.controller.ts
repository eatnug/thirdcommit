import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from '../services/task.service';
import { TenantAccessGuard } from '../../../tenant/tenant-access.guard';
import { CreateTaskDto, UpdateTaskDto } from '../repositories/task.repository';

/**
 * Task controller for Project A
 * Path: /api/project-a/tasks
 */
@Controller('api/:projectId/tasks')
@UseGuards(TenantAccessGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async findAll() {
    // Tenant context is automatically set via middleware
    return this.taskService.getTasks();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.taskService.getTask(id);
  }

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.createTask(createTaskDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(id, updateTaskDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.taskService.deleteTask(id);
  }

  @Put(':id/toggle')
  async toggle(@Param('id') id: string) {
    return this.taskService.toggleTaskCompletion(id);
  }
}
