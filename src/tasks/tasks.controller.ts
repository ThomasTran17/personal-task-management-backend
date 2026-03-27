import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { TaskResponseDto } from './dtos/task-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IUser } from '../users/interfaces/user.interface';
import { TaskStatus, TaskPriority } from './interfaces/task.interface';

@Controller('tasks')
@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Create a new task
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid task data',
  })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: IUser,
  ): Promise<TaskResponseDto> {
    return await this.tasksService.create(user.id, createTaskDto);
  }

  /**
   * Get all tasks for the current user
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all tasks for the current user' })
  @ApiQuery({
    name: 'status',
    enum: TaskStatus,
    required: false,
    description: 'Filter by task status',
  })
  @ApiQuery({
    name: 'priority',
    enum: TaskPriority,
    required: false,
    description: 'Filter by task priority',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tasks',
    type: [TaskResponseDto],
  })
  async findAll(
    @CurrentUser() user: IUser,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
  ): Promise<TaskResponseDto[]> {
    if (status) {
      return await this.tasksService.findByStatus(user.id, status);
    }
    if (priority) {
      return await this.tasksService.findByPriority(user.id, priority);
    }
    return await this.tasksService.findAll(user.id);
  }

  /**
   * Get task statistics for the current user
   */
  @Get('stats/summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get task statistics' })
  @ApiResponse({
    status: 200,
    description: 'Task statistics',
    schema: {
      properties: {
        total: { type: 'number' },
        todo: { type: 'number' },
        inProgress: { type: 'number' },
        done: { type: 'number' },
      },
    },
  })
  async getStatistics(@CurrentUser() user: IUser) {
    return await this.tasksService.getStatistics(user.id);
  }

  /**
   * Get a specific task by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a specific task' })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'task-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Task found',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Permission denied',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: IUser,
  ): Promise<TaskResponseDto> {
    return await this.tasksService.findOneByUser(id, user.id);
  }

  /**
   * Update a task
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'task-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Permission denied',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: IUser,
  ): Promise<TaskResponseDto> {
    return await this.tasksService.update(id, user.id, updateTaskDto);
  }

  /**
   * Delete a task
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'task-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Task deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Permission denied',
  })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: IUser,
  ): Promise<{ message: string }> {
    await this.tasksService.delete(id, user.id);
    return { message: 'Task deleted successfully' };
  }
}
