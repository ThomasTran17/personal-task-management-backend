import { ApiProperty } from '@nestjs/swagger';
import { IUser } from '../interfaces/user.interface';

export class UserResponseDto implements IUser {
  @ApiProperty({
    description: 'ID của user (Firestore document ID)',
    example: 'user123abc',
  })
  id: string;

  @ApiProperty({
    description: 'Email của user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Tên của user',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Họ của user',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'URL ảnh đại diện của user',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatar?: string;

  @ApiProperty({
    description: 'Thời gian tạo user',
    example: '2024-03-27T10:30:00Z',
    required: false,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Thời gian cập nhật user gần nhất',
    example: '2024-03-27T14:45:00Z',
    required: false,
  })
  updatedAt?: Date;
}
