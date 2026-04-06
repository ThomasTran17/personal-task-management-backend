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
  ApiResponse,
  ApiExtraModels,
  getSchemaPath,
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
@ApiExtraModels(TaskResponseDto, MessageResponseDto)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Create a new primary task
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new primary task',
    description:
      'Creates a new primary task for the current authenticated user',
  })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(TaskResponseDto),
        },
      },
      example: {
        data: {
          id: 'task-123',
          ownerId: 'user-456',
          title: 'Complete project documentation',
          description: 'Write comprehensive documentation for the API',
          status: 'TODO',
          priority: 'HIGH',
          participantIds: [],
          dueDate: '2026-04-30T23:59:59Z',
          createdAt: '2026-04-01T10:00:00Z',
          updatedAt: '2026-04-01T10:00:00Z',
          parentId: null,
          subtasks: [],
        },
      },
    },
  })
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
   * Create a subtask for a parent task
   */
  @Post(':parentId/subtasks')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a subtask for a parent task',
    description:
      'Creates a new subtask under a parent task. The parent task must belong to the current user.',
  })
  @ApiParam({
    name: 'parentId',
    description: 'Parent task ID',
    example: 'task-parent-123',
  })
  @ApiResponse({
    status: 201,
    description: 'Subtask created successfully',
    schema: {
      example: {
        data: {
          id: 'subtask-1',
          ownerId: 'user-456',
          title: 'Write API documentation',
          description: 'Document all endpoints',
          status: 'TODO',
          priority: 'HIGH',
          participantIds: [],
          dueDate: '2026-04-20T23:59:59Z',
          createdAt: '2026-04-01T10:00:00Z',
          updatedAt: '2026-04-01T10:00:00Z',
          parentId: 'task-parent-123',
          subtasks: [],
        },
      },
    },
  })
  @ApiJsonApiResponse(TaskResponseDto, 'tasks', 201)
  @ApiJsonApiError(400, 'Invalid subtask data or invalid parent')
  @ApiJsonApiError(404, 'Parent task not found')
  @ApiJsonApiError(403, 'Permission denied')
  @ApiJsonApiError(401, 'Unauthorized')
  async createSubtask(
    @Param('parentId') parentId: string,
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: IUser,
  ): Promise<TaskResponseDto> {
    return await this.tasksService.createSubtask(
      user.id,
      parentId,
      createTaskDto,
    );
  }

  /**
   * Get all primary tasks for the current user
   */
  @Get('primary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all primary tasks for the current user',
    description:
      'Retrieves all primary tasks (without parent) for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Primary tasks retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'task-123',
            ownerId: 'user-456',
            title: 'Complete project documentation',
            description: 'Write comprehensive documentation for the API',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            participantIds: [],
            dueDate: '2026-04-30T23:59:59Z',
            createdAt: '2026-04-01T10:00:00Z',
            updatedAt: '2026-04-05T15:30:00Z',
            parentId: null,
            subtasks: [
              {
                id: 'subtask-1',
                ownerId: 'user-456',
                title: 'Write API documentation',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                parentId: 'task-123',
                subtasks: [],
              },
            ],
          },
        ],
      },
    },
  })
  @ApiJsonApiResponse(TaskResponseDto, 'tasks', 200, false, true)
  @ApiJsonApiError(401, 'Unauthorized')
  async getPrimaryTasks(
    @CurrentUser() user: IUser,
  ): Promise<TaskResponseDto[]> {
    return await this.tasksService.getPrimaryTasks(user.id);
  }

  /**
   * Get all subtasks for a parent task
   */
  @Get(':parentId/subtasks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all subtasks for a parent task',
    description: 'Retrieves all subtasks that belong to a specific parent task',
  })
  @ApiParam({
    name: 'parentId',
    description: 'Parent task ID',
    example: 'task-parent-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Subtasks retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'subtask-1',
            ownerId: 'user-456',
            title: 'Write API documentation',
            description: 'Document all endpoints',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            parentId: 'task-parent-123',
            subtasks: [],
          },
        ],
      },
    },
  })
  @ApiJsonApiResponse(TaskResponseDto, 'tasks', 200, false, true)
  @ApiJsonApiError(404, 'Parent task not found')
  @ApiJsonApiError(401, 'Unauthorized')
  async getSubtasks(
    @Param('parentId') parentId: string,
  ): Promise<TaskResponseDto[]> {
    return await this.tasksService.getSubtasksByParentId(parentId);
  }

  /**
   * Get all tasks for the current user
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all tasks for the current user',
    description:
      'Retrieves all tasks (primary and subtasks with their nested subtasks) for the authenticated user. Supports filtering by status or priority.',
  })
  @ApiQuery({
    name: 'status',
    enum: TaskStatus,
    required: false,
    description: 'Filter by task status (TODO, IN_PROGRESS, DONE)',
  })
  @ApiQuery({
    name: 'priority',
    enum: TaskPriority,
    required: false,
    description: 'Filter by task priority (LOW, MEDIUM, HIGH)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'task-123',
            ownerId: 'user-456',
            title: 'Complete project documentation',
            description: 'Write comprehensive documentation for the API',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            participantIds: [],
            dueDate: '2026-04-30T23:59:59Z',
            createdAt: '2026-04-01T10:00:00Z',
            updatedAt: '2026-04-05T15:30:00Z',
            parentId: null,
            subtasks: [
              {
                id: 'subtask-1',
                ownerId: 'user-456',
                title: 'Write API documentation',
                description: 'Document all endpoints',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                parentId: 'task-123',
                subtasks: [],
              },
            ],
          },
        ],
      },
    },
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
  @ApiOperation({
    summary: 'Get task statistics',
    description:
      'Retrieves task statistics including total count and breakdown by status (TODO, IN_PROGRESS, DONE)',
  })
  @ApiResponse({
    status: 200,
    description: 'Task statistics retrieved successfully',
    schema: {
      example: {
        total: 5,
        todo: 2,
        inProgress: 2,
        done: 1,
      },
    },
  })
  @ApiJsonApiResponse(MessageResponseDto, 'tasks', 200, false, false)
  @ApiJsonApiError(401, 'Unauthorized')
  async getStatistics(@CurrentUser() user: IUser) {
    return await this.tasksService.getStatistics(user.id);
  }

  /**
   * Get a specific task by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a specific task',
    description:
      'Retrieves a single task by ID including all its subtasks. User must be the task owner.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'task-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
    schema: {
      example: {
        data: {
          id: 'task-123',
          ownerId: 'user-456',
          title: 'Complete project documentation',
          description: 'Write comprehensive documentation for the API',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          participantIds: [],
          dueDate: '2026-04-30T23:59:59Z',
          createdAt: '2026-04-01T10:00:00Z',
          updatedAt: '2026-04-05T15:30:00Z',
          parentId: null,
          subtasks: [
            {
              id: 'subtask-1',
              ownerId: 'user-456',
              title: 'Write API documentation',
              status: 'IN_PROGRESS',
              priority: 'HIGH',
              parentId: 'task-123',
              subtasks: [],
            },
          ],
        },
      },
    },
  })
  @ApiJsonApiResponse(TaskResponseDto, 'tasks')
  @ApiJsonApiError(404, 'Task not found')
  @ApiJsonApiError(403, 'Permission denied')
  @ApiJsonApiError(401, 'Unauthorized')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: IUser,
  ): Promise<TaskResponseDto> {
    return await this.tasksService.findOneByOwner(id, user.id);
  }

  /**
   * Update a task
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a task',
    description:
      'Updates specific fields of a task. User must be the task owner. Partial updates are supported.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'task-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    schema: {
      example: {
        data: {
          id: 'task-123',
          ownerId: 'user-456',
          title: 'Complete project documentation (Updated)',
          description: 'Write comprehensive documentation for the API',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          participantIds: [],
          dueDate: '2026-04-30T23:59:59Z',
          createdAt: '2026-04-01T10:00:00Z',
          updatedAt: '2026-04-06T12:00:00Z',
          parentId: null,
          subtasks: [],
        },
      },
    },
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
   * Delete a task (cascade deletes all subtasks)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a task (cascade deletes all subtasks)',
    description:
      'Deletes a task and all its subtasks. User must be the task owner. This operation is irreversible.',
  })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    example: 'task-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Task deleted successfully',
    schema: {
      example: {
        message: 'Task deleted successfully',
      },
    },
  })
  @ApiJsonApiResponse(MessageResponseDto, 'tasks', 200, false, false)
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
