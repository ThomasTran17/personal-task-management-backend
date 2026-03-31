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
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { TaskResponseDto } from './dtos/task-response.dto';
import { MessageResponseDto } from './dtos/message-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IUser } from '../users/interfaces/user.interface';
import { TaskStatus, TaskPriority } from './interfaces/task.interface';
import { Resource } from '../common/decorators/resource.decorator';
import { ApiJsonApiResponse } from '../common/decorators/api-json-api-response.decorator';
import { ApiJsonApiError } from '../common/decorators/api-json-api-error.decorator';

@Controller('tasks')
@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Resource('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Create a new task
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiJsonApiResponse(TaskResponseDto, 'tasks', 201)
  @ApiJsonApiError(400, 'Invalid task data')
  @ApiJsonApiError(401, 'Unauthorized')
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
  @ApiJsonApiResponse(TaskResponseDto, 'tasks', 200, false, true)
  @ApiJsonApiError(401, 'Unauthorized')
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
  @ApiJsonApiResponse(MessageResponseDto, 'resource', 200, false, false)
  @ApiJsonApiError(401, 'Unauthorized')
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
  @ApiJsonApiResponse(TaskResponseDto, 'tasks')
  @ApiJsonApiError(404, 'Task not found')
  @ApiJsonApiError(403, 'Permission denied')
  @ApiJsonApiError(401, 'Unauthorized')
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
  @ApiJsonApiResponse(TaskResponseDto, 'tasks')
  @ApiJsonApiError(404, 'Task not found')
  @ApiJsonApiError(403, 'Permission denied')
  @ApiJsonApiError(400, 'Invalid task data')
  @ApiJsonApiError(401, 'Unauthorized')
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
  @ApiJsonApiResponse(MessageResponseDto, 'resource', 200, false, false)
  @ApiJsonApiError(404, 'Task not found')
  @ApiJsonApiError(403, 'Permission denied')
  @ApiJsonApiError(401, 'Unauthorized')
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: IUser,
  ): Promise<{ message: string }> {
    await this.tasksService.delete(id, user.id);
    return { message: 'Task deleted successfully' };
  }
}
