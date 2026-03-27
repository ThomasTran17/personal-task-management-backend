import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'newemail@example.com',
    required: false,
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'Jane',
    required: false,
  })
  @IsString({ message: 'First name must be a string' })
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Smith',
    required: false,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'Avatar URL of the user',
    example: 'https://example.com/new-avatar.jpg',
    required: false,
  })
  @IsString({ message: 'Avatar must be a string' })
  @IsOptional()
  avatar?: string;
}
