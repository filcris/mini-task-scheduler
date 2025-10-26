import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

type DateLike = string | number | Date | null | undefined;

export class CreateTaskDto {
  @ApiProperty({ example: 'Comprar café' })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'Pacote de 1kg moído' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.todo })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, example: TaskPriority.medium })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ type: String, example: '2025-10-27T10:00:00.000Z' })
  @IsOptional()
  @Transform(({ value }: { value: DateLike }) => {
    if (value == null || value === '') return undefined;
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
  })
  @IsDate()
  dueAt?: Date | null;
}


