import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Success message here',
  })
  message: string;
}
