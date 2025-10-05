import { Module } from '@nestjs/common';
import { TaskController } from './controllers/task.controller';
import { TaskService } from './services/task.service';
import { TaskRepository } from './repositories/task.repository';

/**
 * Module for Project A
 * Contains all Project A specific functionality
 */
@Module({
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
})
export class ProjectAModule {}
