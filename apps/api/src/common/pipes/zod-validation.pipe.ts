import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation pipe using Zod schemas.
 * Usage: @Body(new ZodValidationPipe(mySchema)) data: MyType
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        throw new BadRequestException({
          success: false,
          error: 'Validation failed',
          details: messages,
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
