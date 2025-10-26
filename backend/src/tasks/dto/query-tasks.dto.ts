import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsISO8601,
  Min,
} from 'class-validator';

export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export class QueryTasksDto {
  @IsOptional()
  @IsEnum(['todo', 'doing', 'done'] as const, {
    message: 'status must be todo|doing|done',
  })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'] as const, {
    message: 'priority must be low|medium|high',
  })
  priority?: TaskPriority;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsISO8601()
  dueFrom?: string;

  @IsOptional()
  @IsISO8601()
  dueTo?: string;

  /** paginação baseada em página (continua suportada) */
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(1)
  page?: number;

  /** tamanho da página (continua suportado) */
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(1)
  pageSize?: number;

  /** alternativa simples: limite direto (os testes usam) */
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(1)
  limit?: number;

  /** filtro “overdue”; os testes comparam string 'true'/'false' */
  @IsOptional()
  @IsEnum(['true', 'false'] as const)
  overdue?: 'true' | 'false';
}


