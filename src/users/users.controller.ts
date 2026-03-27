import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  // ApiResponse,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user
   * POST /users
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'Create a new user in the system with the provided information',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Email already registered or invalid data',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return await this.usersService.create(createUserDto);
  }

  /**
   * Get all users
   * GET /users
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of all users',
    description: 'Retrieve a list of all users in the system',
  })
  @ApiOkResponse({
    description: 'Users list retrieved successfully',
    type: [UserResponseDto],
  })
  async findAll(): Promise<UserResponseDto[]> {
    return await this.usersService.findAll();
  }

  /**
   * Get user by ID
   * GET /users/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve detailed information of a user by ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'User ID to retrieve',
    example: 'user123',
  })
  @ApiOkResponse({
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User does not exist',
  })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.usersService.findOne(id);
  }

  /**
   * Get user by email
   * GET /users/email/:email
   */
  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user by email',
    description: 'Retrieve detailed information of a user by email',
  })
  @ApiParam({
    name: 'email',
    type: String,
    description: 'User email to retrieve',
    example: 'user@example.com',
  })
  @ApiOkResponse({
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User with this email does not exist',
  })
  async findByEmail(@Param('email') email: string): Promise<UserResponseDto> {
    return await this.usersService.findByEmail(email);
  }

  /**
   * Update user
   * PUT /users/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user information',
    description:
      'Update a user information by ID. Only send fields that need to be updated',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'User ID to update',
    example: 'user123',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'New email already registered or invalid data',
  })
  @ApiNotFoundResponse({
    description: 'User does not exist',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return await this.usersService.update(id, updateUserDto);
  }

  /**
   * Delete user
   * DELETE /users/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete a user from the system by ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'User ID to delete',
    example: 'user123',
  })
  @ApiNoContentResponse({
    description: 'User deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'User does not exist',
  })
  async delete(@Param('id') id: string): Promise<void> {
    return await this.usersService.delete(id);
  }
}
