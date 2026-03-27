import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../interfaces/task.interface';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Title of the task',
    example: 'Complete project documentation',
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({
    description: 'Description of the task',
    example: 'Write comprehensive documentation for the project',
    required: false,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Status of the task',
    enum: TaskStatus,
    example: TaskStatus.TODO,
    required: false,
  })
  @IsEnum(TaskStatus, { message: 'Status must be one of: TODO, IN_PROGRESS, DONE' })
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({
    description: 'Priority of the task',
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
    required: false,
  })
  @IsEnum(TaskPriority, { message: 'Priority must be one of: LOW, MEDIUM, HIGH' })
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({
    description: 'Due date of the task',
    example: '2026-12-31',
    required: false,
  })
  @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
  @IsOptional()
  dueDate?: string;
}
