import { Module } from '@nestjs/common';
import { TaskController } from './controllers/task.controller';
import { TaskService } from './services/task.service';
import { TaskRepository } from './repositories/task.repository';

/**
 * Module for Project B
 * Contains all Project B specific functionality
 */
@Module({
  controllers: [TaskController],
  providers: [TaskService, TaskRepository],
})
export class ProjectBModule {}
