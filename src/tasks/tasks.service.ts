import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TasksRepository } from './repositories/tasks.repository';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { ITask, TaskStatus, TaskPriority } from './interfaces/task.interface';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  /**
   * Create a new task for the user
   */
  async create(userId: string, createTaskDto: CreateTaskDto): Promise<ITask> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return await this.tasksRepository.create(userId, createTaskDto);
  }

  /**
   * Get all tasks for the user
   */
  async findAll(userId: string): Promise<ITask[]> {
    return await this.tasksRepository.findByUserId(userId);
  }

  /**
   * Get task by ID
   */
  async findOne(taskId: string): Promise<ITask> {
    const task = await this.tasksRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} does not exist`);
    }
    return task;
  }

  /**
   * Get task by ID and verify ownership
   */
  async findOneByUser(taskId: string, userId: string): Promise<ITask> {
    const task = await this.findOne(taskId);

    if (task.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this task');
    }

    return task;
  }

  /**
   * Get all tasks for user by status
   */
  async findByStatus(userId: string, status: TaskStatus): Promise<ITask[]> {
    return await this.tasksRepository.findByUserIdAndStatus(userId, status);
  }

  /**
   * Get all tasks for user by priority
   */
  async findByPriority(userId: string, priority: TaskPriority): Promise<ITask[]> {
    return await this.tasksRepository.findByUserIdAndPriority(userId, priority);
  }

  /**
   * Update task
   */
  async update(
    taskId: string,
    userId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<ITask> {
    // Check if task exists and belongs to user
    const task = await this.findOneByUser(taskId, userId);

    return await this.tasksRepository.update(taskId, updateTaskDto);
  }

  /**
   * Delete task
   */
  async delete(taskId: string, userId: string): Promise<void> {
    // Check if task exists and belongs to user
    await this.findOneByUser(taskId, userId);

    const deleted = await this.tasksRepository.delete(taskId);
    if (!deleted) {
      throw new NotFoundException(`Task with ID ${taskId} does not exist`);
    }
  }

  /**
   * Get task statistics for user
   */
  async getStatistics(userId: string): Promise<{
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  }> {
    const allTasks = await this.findAll(userId);
    
    return {
      total: allTasks.length,
      todo: allTasks.filter((t) => t.status === TaskStatus.TODO).length,
      inProgress: allTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      done: allTasks.filter((t) => t.status === TaskStatus.DONE).length,
    };
  }
}
