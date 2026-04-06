import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../interfaces/task.interface';

export class TaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority })
  priority: TaskPriority;

  @ApiProperty({ type: [String], required: false })
  participantIds: string[];

  @ApiProperty({ required: false })
  dueDate?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true, required: false })
  parentId: string | null;

  @ApiProperty({ type: [TaskResponseDto], required: false })
  subtasks?: TaskResponseDto[];
}
