import { TaskPriority, TaskStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryTasksDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  overdue?: 'true' | 'false';

  @IsOptional()
  @Transform(({ value }: { value?: string | null }) => (value ? value : undefined))
  @IsString()
  dueFrom?: string;

  @IsOptional()
  @Transform(({ value }: { value?: string | null }) => (value ? value : undefined))
  @IsString()
  dueTo?: string;
}



