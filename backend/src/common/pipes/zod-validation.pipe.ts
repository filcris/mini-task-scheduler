import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform<unknown, unknown> {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const issues = result.error.issues.map(
        (i) => `${i.path.join('.') || '<root>'}: ${i.message}`,
      );
      throw new BadRequestException({ message: 'Validation failed', issues });
    }
    return result.data;
  }
}

