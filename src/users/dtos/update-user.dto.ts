import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Email của user',
    example: 'newemail@example.com',
    required: false,
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Tên của user',
    example: 'Jane',
    required: false,
  })
  @IsString({ message: 'Tên phải là chuỗi' })
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Họ của user',
    example: 'Smith',
    required: false,
  })
  @IsString({ message: 'Họ phải là chuỗi' })
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'URL ảnh đại diện của user',
    example: 'https://example.com/new-avatar.jpg',
    required: false,
  })
  @IsString({ message: 'Avatar phải là chuỗi' })
  @IsOptional()
  avatar?: string;
}
