import { TaskPriority, TaskStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryTasksDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value as string, 10))
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value as string, 10))
  pageSize?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  dueFrom?: string;

  @IsOptional()
  @IsString()
  dueTo?: string;

  @IsOptional()
  @IsIn([TaskStatus.todo, TaskStatus.doing, TaskStatus.done])
  status?: TaskStatus;

  @IsOptional()
  @IsIn([TaskPriority.low, TaskPriority.medium, TaskPriority.high])
  priority?: TaskPriority;

  /** usado em alguns testes */
  @IsOptional()
  @IsIn(['true', 'false'])
  overdue?: 'true' | 'false';
}





