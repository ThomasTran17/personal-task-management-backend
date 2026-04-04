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
   * Create a new primary task for the user
   */
  async create(ownerId: string, createTaskDto: CreateTaskDto): Promise<ITask> {
    if (!ownerId) {
      throw new BadRequestException('Owner ID is required');
    }

    const task = await this.tasksRepository.create(ownerId, createTaskDto);
    return this.mapTimestampsToIso(task);
  }

  /**
   * Create a subtask for a parent task
   */
  async createSubtask(
    ownerId: string,
    parentId: string,
    createTaskDto: CreateTaskDto,
  ): Promise<ITask> {
    if (!ownerId) {
      throw new BadRequestException('Owner ID is required');
    }

    if (!parentId) {
      throw new BadRequestException('Parent ID is required');
    }

    // Verify parent task exists and belongs to user
    const parentTask = await this.findOneByOwner(parentId, ownerId);
    if (!parentTask) {
      throw new NotFoundException('Parent task not found');
    }

    try {
      const task = await this.tasksRepository.createSubtask(
        ownerId,
        createTaskDto,
        parentId,
      );
      return this.mapTimestampsToIso(task);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(message);
    }
  }

  /**
   * Get all primary tasks for the user
   */
  async getPrimaryTasks(ownerId: string): Promise<ITask[]> {
    const tasks = await this.tasksRepository.getPrimaryTasks(ownerId);
    return tasks.map((task) => this.mapTimestampsToIso(task));
  }

  /**
   * Get all subtasks for a parent task
   */
  async getSubtasksByParentId(parentId: string): Promise<ITask[]> {
    const tasks = await this.tasksRepository.getSubtasksByParentId(parentId);
    return tasks.map((task) => this.mapTimestampsToIso(task));
  }

  /**
   * Get all tasks for the user
   */
  async findAll(ownerId: string): Promise<ITask[]> {
    const tasks = await this.tasksRepository.findByOwnerId(ownerId);
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
  async findOneByOwner(taskId: string, ownerId: string): Promise<ITask> {
    const task = await this.findOne(taskId);

    if (task.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You do not have permission to access this task',
      );
    }

    return task;
  }

  /**
   * Get all tasks for user by status
   */
  async findByStatus(ownerId: string, status: TaskStatus): Promise<ITask[]> {
    const tasks = await this.tasksRepository.findByOwnerIdAndStatus(
      ownerId,
      status,
    );
    return tasks.map((task) => this.mapTimestampsToIso(task));
  }

  /**
   * Get all tasks for user by priority
   */
  async findByPriority(
    ownerId: string,
    priority: TaskPriority,
  ): Promise<ITask[]> {
    const tasks = await this.tasksRepository.findByOwnerIdAndPriority(
      ownerId,
      priority,
    );
    return tasks.map((task) => this.mapTimestampsToIso(task));
  }

  /**
   * Update task
   */
  async update(
    taskId: string,
    ownerId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<ITask> {
    // Check if task exists and belongs to user
    await this.findOneByOwner(taskId, ownerId);

    const updated = await this.tasksRepository.update(taskId, updateTaskDto);
    return this.mapTimestampsToIso(updated);
  }

  /**
   * Delete task (cascade deletes all subtasks)
   */
  async delete(taskId: string, ownerId: string): Promise<void> {
    // Check if task exists and belongs to user
    await this.findOneByOwner(taskId, ownerId);

    const deleted = await this.tasksRepository.delete(taskId);
    if (!deleted) {
      throw new NotFoundException(`Task with ID ${taskId} does not exist`);
    }
  }

  /**
   * Get task statistics for user
   */
  async getStatistics(ownerId: string): Promise<{
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  }> {
    const allTasks = await this.findAll(ownerId);

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
        : new Date(),
      updatedAt: task.updatedAt
        ? this.convertTimestampToDate(task.updatedAt)
        : new Date(),
    };
  }

  /**
   * Convert Firebase Timestamp object to Date
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
