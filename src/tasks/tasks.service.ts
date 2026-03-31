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

    const task = await this.tasksRepository.create(userId, createTaskDto);
    return this.mapTimestampsToIso(task);
  }

  /**
   * Get all tasks for the user
   */
  async findAll(userId: string): Promise<ITask[]> {
    const tasks = await this.tasksRepository.findByUserId(userId);
    return tasks.map((task) => this.mapTimestampsToIso(task));
  }

  /**
   * Get task by ID
   */
  async findOne(taskId: string): Promise<ITask> {
    const task = await this.tasksRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} does not exist`);
    }
    return this.mapTimestampsToIso(task);
  }

  /**
   * Get task by ID and verify ownership
   */
  async findOneByUser(taskId: string, userId: string): Promise<ITask> {
    const task = await this.findOne(taskId);

    if (task.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this task',
      );
    }

    return task;
  }

  /**
   * Get all tasks for user by status
   */
  async findByStatus(userId: string, status: TaskStatus): Promise<ITask[]> {
    const tasks = await this.tasksRepository.findByUserIdAndStatus(
      userId,
      status,
    );
    return tasks.map((task) => this.mapTimestampsToIso(task));
  }

  /**
   * Get all tasks for user by priority
   */
  async findByPriority(
    userId: string,
    priority: TaskPriority,
  ): Promise<ITask[]> {
    const tasks = await this.tasksRepository.findByUserIdAndPriority(
      userId,
      priority,
    );
    return tasks.map((task) => this.mapTimestampsToIso(task));
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
    await this.findOneByUser(taskId, userId);

    const updated = await this.tasksRepository.update(taskId, updateTaskDto);
    return this.mapTimestampsToIso(updated);
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
      inProgress: allTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS)
        .length,
      done: allTasks.filter((t) => t.status === TaskStatus.DONE).length,
    };
  }

  /**
   * Convert Firebase Timestamps to ISO strings
   */
  private mapTimestampsToIso(task: ITask): ITask {
    return {
      ...task,
      dueDate: task.dueDate
        ? this.convertTimestampToDate(task.dueDate)
        : undefined,
      createdAt: task.createdAt
        ? this.convertTimestampToDate(task.createdAt)
        : undefined,
      updatedAt: task.updatedAt
        ? this.convertTimestampToDate(task.updatedAt)
        : undefined,
    };
  }

  /**
   * Convert Firebase Timestamp object to ISO string date
   */
  private convertTimestampToDate(timestamp: unknown): Date {
    if (!timestamp) {
      return new Date();
    }

    // If it's already a Date, return it
    if (timestamp instanceof Date) {
      return timestamp;
    }

    // If it's a Firebase Timestamp object with _seconds and _nanoseconds
    const ts = timestamp as Record<string, unknown>;
    if (ts._seconds && typeof ts._seconds === 'number') {
      return new Date(ts._seconds * 1000);
    }

    // If it's a number (milliseconds)
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }

    return new Date();
  }
}
