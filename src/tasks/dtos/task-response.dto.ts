import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../interfaces/task.interface';

export class TaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority })
  priority: TaskPriority;

  @ApiProperty({ required: false })
  dueDate?: Date;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;
}
