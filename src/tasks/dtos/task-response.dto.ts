import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../interfaces/task.interface';

export class TaskResponseDto {
  @ApiProperty({
    example: 'task-123',
    description: 'Unique task identifier',
  })
  id: string;

  @ApiProperty({
    example: 'user-456',
    description: 'ID of the task owner',
  })
  ownerId: string;

  @ApiProperty({
    example: 'Complete project documentation',
    description: 'Task title',
  })
  title: string;

  @ApiProperty({
    example: 'Write comprehensive documentation for the API',
    description: 'Task description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
    description: 'Current status of the task',
  })
  status: TaskStatus;

  @ApiProperty({
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    description: 'Priority level of the task',
  })
  priority: TaskPriority;

  @ApiProperty({
    type: [String],
    example: ['user-789', 'user-101'],
    description: 'List of user IDs who are participants in this task',
    required: false,
  })
  participantIds: string[];

  @ApiProperty({
    example: '2026-04-30T23:59:59Z',
    description: 'Task due date',
    required: false,
  })
  dueDate?: Date;

  @ApiProperty({
    example: '2026-04-01T10:00:00Z',
    description: 'Task creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-04-05T15:30:00Z',
    description: 'Task last update timestamp',
  })
  updatedAt: Date;

  @ApiProperty({
    example: null,
    description: 'Parent task ID (null for primary tasks)',
    nullable: true,
    required: false,
  })
  parentId: string | null;

  @ApiProperty({
    type: [TaskResponseDto],
    description: 'List of subtasks for this task',
    required: false,
    example: [
      {
        id: 'subtask-1',
        ownerId: 'user-456',
        title: 'Write API documentation',
        description: 'Document all endpoints',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        participantIds: [],
        dueDate: '2026-04-20T23:59:59Z',
        createdAt: '2026-04-01T10:00:00Z',
        updatedAt: '2026-04-05T15:30:00Z',
        parentId: 'task-123',
        subtasks: [],
      },
    ],
  })
  subtasks?: TaskResponseDto[];
}
