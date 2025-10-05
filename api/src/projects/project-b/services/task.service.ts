import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskRepository, CreateTaskDto, UpdateTaskDto } from '../repositories/task.repository';

/**
 * Service layer for Task business logic in Project B
 */
@Injectable()
export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  async getTasks() {
    return this.taskRepository.findAll();
  }

  async getTask(id: string) {
    const task = await this.taskRepository.findOne(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async createTask(data: CreateTaskDto) {
    return this.taskRepository.create(data);
  }

  async updateTask(id: string, data: UpdateTaskDto) {
    await this.getTask(id); // Verify task exists
    return this.taskRepository.update(id, data);
  }

  async deleteTask(id: string) {
    await this.getTask(id); // Verify task exists
    return this.taskRepository.delete(id);
  }

  async toggleTaskCompletion(id: string) {
    const task = await this.getTask(id);
    return this.taskRepository.update(id, { completed: !task.completed });
  }
}
