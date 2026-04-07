import { Injectable } from '@nestjs/common';
import { getFirestore, WriteBatch } from 'firebase-admin/firestore';
import * as firebaseAdmin from 'firebase-admin';
import { ITask, TaskStatus, TaskPriority } from '../interfaces/task.interface';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';

@Injectable()
export class TasksRepository {
  private readonly db = getFirestore();
  private readonly collection = 'tasks';
  private readonly MAX_SUBTASK_DEPTH = 1;

  /**
   * Create a new task
   */
  async create(ownerId: string, createTaskDto: CreateTaskDto): Promise<ITask> {
    const taskRef = this.db.collection(this.collection).doc();
    const task: ITask = {
      id: taskRef.id,
      ownerId,
      title: createTaskDto.title,
      description: createTaskDto.description || '',
      status: createTaskDto.status || TaskStatus.TODO,
      priority: createTaskDto.priority || TaskPriority.MEDIUM,
      participantIds: createTaskDto.participantIds || [],
      parentId: createTaskDto.parentId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Only set dueDate if provided and not null
    if (createTaskDto.dueDate && createTaskDto.dueDate !== null) {
      task.dueDate = new Date(createTaskDto.dueDate);
    }

    await taskRef.set(task);
    return task;
  }

  /**
   * Get all primary tasks for a user (parentId == null)
   */
  async getPrimaryTasks(ownerId: string): Promise<ITask[]> {
    const snapshot = await this.db
      .collection(this.collection)
      .where('ownerId', '==', ownerId)
      .where('parentId', '==', null)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => doc.data() as ITask);
  }

  /**
   * Get all subtasks for a parent task
   */
  async getSubtasksByParentId(parentId: string): Promise<ITask[]> {
    const snapshot = await this.db
      .collection(this.collection)
      .where('parentId', '==', parentId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => doc.data() as ITask);
  }

  /**
   * Create a subtask with max depth validation
   */
  async createSubtask(
    ownerId: string,
    createTaskDto: CreateTaskDto,
    parentId: string,
  ): Promise<ITask> {
    // Validate max depth: parent task must have parentId == null
    const parentTask = await this.findById(parentId);
    if (!parentTask) {
      throw new Error('Parent task not found');
    }

    if (parentTask.parentId !== null) {
      throw new Error(
        `Cannot create subtask of a subtask. Max depth is ${this.MAX_SUBTASK_DEPTH}`,
      );
    }

    createTaskDto.parentId = parentId;
    return this.create(ownerId, createTaskDto);
  }

  /**
   * Get all tasks for a user
   */
  async findByOwnerId(ownerId: string): Promise<ITask[]> {
    const snapshot = await this.db
      .collection(this.collection)
      .where('ownerId', '==', ownerId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => doc.data() as ITask);
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
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Copy non-dueDate fields
    if (updateTaskDto.title !== undefined)
      updateData.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined)
      updateData.description = updateTaskDto.description;
    if (updateTaskDto.status !== undefined)
      updateData.status = updateTaskDto.status;
    if (updateTaskDto.priority !== undefined)
      updateData.priority = updateTaskDto.priority;
    if (updateTaskDto.participantIds !== undefined)
      updateData.participantIds = updateTaskDto.participantIds;

    // Handle dueDate: convert to Date object or delete field
    if ('dueDate' in updateTaskDto) {
      if (updateTaskDto.dueDate === null) {
        // Delete the field using Firestore's deleteField()
        updateData.dueDate = firebaseAdmin.firestore.FieldValue.delete();
      } else if (updateTaskDto.dueDate) {
        updateData.dueDate = new Date(updateTaskDto.dueDate);
      }
    }

    await this.db.collection(this.collection).doc(id).update(updateData);

    const updated = await this.findById(id);
    return updated!;
  }

  /**
   * Delete task and all subtasks (cascade delete)
   */
  async delete(id: string): Promise<boolean> {
    const doc = await this.db.collection(this.collection).doc(id).get();
    if (!doc.exists) {
      return false;
    }

    const batch: WriteBatch = this.db.batch();

    // Delete the task itself
    batch.delete(doc.ref);

    // Delete all subtasks (cascade delete)
    const subtasks = await this.getSubtasksByParentId(id);
    subtasks.forEach((subtask) => {
      batch.delete(this.db.collection(this.collection).doc(subtask.id));
    });

    await batch.commit();
    return true;
  }

  /**
   * Get tasks by status for a user
   */
  async findByOwnerIdAndStatus(
    ownerId: string,
    status: TaskStatus,
  ): Promise<ITask[]> {
    const snapshot = await this.db
      .collection(this.collection)
      .where('ownerId', '==', ownerId)
      .where('status', '==', status)
      .orderBy('priority', 'desc')
      .orderBy('dueDate', 'asc')
      .get();

    return snapshot.docs.map((doc) => doc.data() as ITask);
  }

  /**
   * Get tasks by priority for a user
   */
  async findByOwnerIdAndPriority(
    ownerId: string,
    priority: TaskPriority,
  ): Promise<ITask[]> {
    const snapshot = await this.db
      .collection(this.collection)
      .where('ownerId', '==', ownerId)
      .where('priority', '==', priority)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => doc.data() as ITask);
  }

  /**
   * Check if task belongs to user
   */
  async belongsToUser(taskId: string, ownerId: string): Promise<boolean> {
    const task = await this.findById(taskId);
    return task?.ownerId === ownerId;
  }
}
