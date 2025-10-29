import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum TaskStatus {
  TODO = 'TODO',
  DOING = 'DOING',
  DONE = 'DONE',
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Preparar apresentação' })
  @IsString()
  @IsNotEmpty()
  title!: string

  @ApiPropertyOptional({ example: 'Slides e resumo até sexta' })
  @IsOptional()
  @IsString()
  description?: string | null

  @ApiPropertyOptional({ enum: TaskPriority, example: TaskPriority.MEDIUM, default: TaskPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.TODO, default: TaskStatus.TODO })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @ApiPropertyOptional({ example: '2025-10-30T00:00:00.000Z', description: 'Data limite (ISO 8601)' })
  @IsOptional()
  @IsISO8601()
  dueDate?: string | null
}
