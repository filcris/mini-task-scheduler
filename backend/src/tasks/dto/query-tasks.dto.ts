import { Transform } from 'class-transformer';
import { IsBooleanString,IsIn, IsInt, IsOptional } from 'class-validator';

export class QueryTasksDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsOptional()
  page?: number = 1;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsOptional()
  limit?: number = 10;

  @IsOptional()
  @IsIn(['todo', 'doing', 'done'])
  status?: 'todo' | 'doing' | 'done';

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  // overdue=true -> dueAt < now AND status != done
  @IsOptional()
  @IsBooleanString()
  overdue?: 'true' | 'false';
}
