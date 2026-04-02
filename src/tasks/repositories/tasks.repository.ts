import { Injectable } from '@nestjs/common';
import { getFirestore } from 'firebase-admin/firestore';
import { ITask, TaskStatus, TaskPriority } from '../interfaces/task.interface';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';

@Injectable()
export class TasksRepository {
  private readonly db = getFirestore();
  private readonly collection = 'tasks';

  /**
   * Create a new task
   */
  async create(userId: string, createTaskDto: CreateTaskDto): Promise<ITask> {
    const taskRef = this.db.collection(this.collection).doc();
    const task: ITask = {
      id: taskRef.id,
      userId,
      title: createTaskDto.title,
      description: createTaskDto.description || "",
      status: createTaskDto.status || TaskStatus.TODO,
      priority: createTaskDto.priority || TaskPriority.MEDIUM,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (createTaskDto.dueDate) {
      task.dueDate = new Date(createTaskDto.dueDate);
    }

    await taskRef.set(task);
    return task;
  }

  /**
   * Get all tasks for a user
   */
  async findByUserId(userId: string): Promise<ITask[]> {
    const snapshot = await this.db
      .collection(this.collection)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      ...(doc.data() as ITask),
    }));
  }

  /**
   * Get task by ID
   */
  async findById(id: string): Promise<ITask | null> {
    const doc = await this.db.collection(this.collection).doc(id).get();
    return doc.exists ? (doc.data() as ITask) : null;
  }

  /**
   * Update task
   */
  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<ITask> {
    const updateData: Partial<ITask> = {
      ...updateTaskDto,
      dueDate: updateTaskDto.dueDate
        ? new Date(updateTaskDto.dueDate)
        : undefined,
      updatedAt: new Date(),
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    await this.db.collection(this.collection).doc(id).update(updateData);

    const updated = await this.findById(id);
    return updated!;
  }

  /**
   * Delete task
   */
  async delete(id: string): Promise<boolean> {
    const doc = await this.db.collection(this.collection).doc(id).get();
    if (!doc.exists) {
      return false;
    }

    await this.db.collection(this.collection).doc(id).delete();
    return true;
  }

  /**
   * Get tasks by status for a user
   */
  async findByUserIdAndStatus(
    userId: string,
    status: TaskStatus,
  ): Promise<ITask[]> {
    const snapshot = await this.db
      .collection(this.collection)
      .where('userId', '==', userId)
      .where('status', '==', status)
      .orderBy('priority', 'desc')
      .orderBy('dueDate', 'asc')
      .get();

    return snapshot.docs.map((doc) => doc.data() as ITask);
  }

  /**
   * Get tasks by priority for a user
   */
  async findByUserIdAndPriority(
    userId: string,
    priority: TaskPriority,
  ): Promise<ITask[]> {
    const snapshot = await this.db
      .collection(this.collection)
      .where('userId', '==', userId)
      .where('priority', '==', priority)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => doc.data() as ITask);
  }

  /**
   * Check if task belongs to user
   */
  async belongsToUser(taskId: string, userId: string): Promise<boolean> {
    const task = await this.findById(taskId);
    return task?.userId === userId;
  }
}
