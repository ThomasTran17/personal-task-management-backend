import { ApiProperty } from '@nestjs/swagger';
import { IUser } from '../interfaces/user.interface';

export class UserResponseDto implements IUser {
  @ApiProperty({
    description: 'User ID (Firestore document ID)',
    example: 'user123abc',
  })
  id: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Avatar URL of the user',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatar?: string;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2024-03-27T10:30:00Z',
    required: false,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2024-03-27T14:45:00Z',
    required: false,
  })
  updatedAt?: Date;
}
