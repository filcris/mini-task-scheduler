import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ required: false, enum: ['todo', 'doing', 'done'] })
  @IsOptional()
  @IsEnum(['todo', 'doing', 'done'] as any)
  status?: TaskStatus;

  @ApiProperty({ required: false, enum: ['low', 'medium', 'high'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'] as any)
  priority?: TaskPriority;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  dueAt?: string | null;
}

