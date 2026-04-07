import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../interfaces/task.interface';

export class UpdateTaskDto {
  @ApiProperty({
    description: 'Title of the task',
    example: 'Complete project documentation',
    required: false,
  })
  @IsString({ message: 'Title must be a string' })
  @IsOptional()
  title?: string;

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
    example: TaskStatus.IN_PROGRESS,
    required: false,
  })
  @IsEnum(TaskStatus, {
    message: 'Status must be one of: TODO, IN_PROGRESS, DONE',
  })
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({
    description: 'Priority of the task',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    required: false,
  })
  @IsEnum(TaskPriority, {
    message: 'Priority must be one of: LOW, MEDIUM, HIGH',
  })
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({
    description: 'List of participant IDs',
    example: ['user-1', 'user-2'],
    required: false,
  })
  @IsArray({ message: 'Participant IDs must be an array' })
  @IsOptional()
  participantIds?: string[];

  @ApiProperty({
    description: 'Due date of the task. Set to null to remove the due date.',
    example: '2026-12-31',
    required: false,
    nullable: true,
  })
  @ValidateIf((obj) => obj.dueDate !== null && obj.dueDate !== undefined)
  @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
  @IsOptional()
  dueDate?: string | null;
}
