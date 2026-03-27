import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email của user',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  email: string;

  @ApiProperty({
    description: 'Tên của user',
    example: 'John',
  })
  @IsString({ message: 'Tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên là bắt buộc' })
  firstName: string;

  @ApiProperty({
    description: 'Họ của user',
    example: 'Doe',
  })
  @IsString({ message: 'Họ phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ là bắt buộc' })
  lastName: string;

  @ApiProperty({
    description: 'URL ảnh đại diện của user',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsString({ message: 'Avatar phải là chuỗi' })
  @IsOptional()
  avatar?: string;
}
