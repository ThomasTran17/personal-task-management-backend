export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface ITask {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  status: TaskStatus;
  priority: TaskPriority;
  participantIds: string[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  parentId: string | null;
}
