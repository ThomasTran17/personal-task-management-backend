import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Logout success message',
    example: 'Logged out successfully',
  })
  message: string;
}
