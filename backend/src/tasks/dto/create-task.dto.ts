import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator'

/** ATENÇÃO: estes enums refletem o teu schema.prisma (minúsculas) */
export enum TaskStatus {
  todo = 'todo',
  doing = 'doing',
  done = 'done',
}

export enum TaskPriority {
  low = 'low',
  medium = 'medium',
  high = 'high',
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

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.medium,
    default: TaskPriority.medium,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.todo,
    default: TaskStatus.todo,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @ApiPropertyOptional({
    example: '2025-10-30T00:00:00.000Z',
    description: 'Data limite (ISO 8601). No modelo é guardado em dueAt.',
  })
  @IsOptional()
  @IsISO8601()
  dueDate?: string | null

  @ApiPropertyOptional({
    example: '2025-10-30T00:00:00.000Z',
    description: 'Alternativa direta ao dueDate — será mapeado para dueAt no modelo.',
  })
  @IsOptional()
  @IsISO8601()
  dueAt?: string | null
}





