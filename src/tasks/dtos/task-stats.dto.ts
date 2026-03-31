import { ApiProperty } from '@nestjs/swagger';

export class TaskStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  todo: number;

  @ApiProperty()
  inProgress: number;

  @ApiProperty()
  done: number;
}
