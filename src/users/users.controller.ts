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
  ApiResponse,
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
   * Tạo user mới
   * POST /users
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo user mới',
    description: 'Tạo một user mới trong hệ thống với thông tin được cung cấp',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'User được tạo thành công',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Email đã được đăng ký hoặc dữ liệu không hợp lệ',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return await this.usersService.create(createUserDto);
  }

  /**
   * Lấy tất cả users
   * GET /users
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lấy danh sách tất cả users',
    description: 'Truy xuất danh sách tất cả users trong hệ thống',
  })
  @ApiOkResponse({
    description: 'Danh sách users được truy xuất thành công',
    type: [UserResponseDto],
  })
  async findAll(): Promise<UserResponseDto[]> {
    return await this.usersService.findAll();
  }

  /**
   * Lấy user theo ID
   * GET /users/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lấy user theo ID',
    description: 'Truy xuất thông tin chi tiết của một user theo ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID của user cần lấy',
    example: 'user123',
  })
  @ApiOkResponse({
    description: 'User được tìm thấy',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User không tồn tại',
  })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.usersService.findOne(id);
  }

  /**
   * Lấy user theo email
   * GET /users/email/:email
   */
  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lấy user theo email',
    description: 'Truy xuất thông tin chi tiết của một user theo email',
  })
  @ApiParam({
    name: 'email',
    type: String,
    description: 'Email của user cần lấy',
    example: 'user@example.com',
  })
  @ApiOkResponse({
    description: 'User được tìm thấy',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User với email này không tồn tại',
  })
  async findByEmail(@Param('email') email: string): Promise<UserResponseDto> {
    return await this.usersService.findByEmail(email);
  }

  /**
   * Cập nhật user
   * PUT /users/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cập nhật thông tin user',
    description: 'Cập nhật thông tin của một user theo ID. Chỉ cần gửi những trường cần cập nhật',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID của user cần cập nhật',
    example: 'user123',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'User được cập nhật thành công',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Email mới đã được đăng ký hoặc dữ liệu không hợp lệ',
  })
  @ApiNotFoundResponse({
    description: 'User không tồn tại',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return await this.usersService.update(id, updateUserDto);
  }

  /**
   * Xóa user
   * DELETE /users/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa user',
    description: 'Xóa một user khỏi hệ thống theo ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID của user cần xóa',
    example: 'user123',
  })
  @ApiNoContentResponse({
    description: 'User được xóa thành công',
  })
  @ApiNotFoundResponse({
    description: 'User không tồn tại',
  })
  async delete(@Param('id') id: string): Promise<void> {
    return await this.usersService.delete(id);
  }
}
