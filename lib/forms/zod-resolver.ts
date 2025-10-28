import type { Resolver } from 'react-hook-form';
import type { ZodTypeAny } from 'zod';

type InferSchema<TSchema extends ZodTypeAny> = TSchema['_type'];

/**
 * Minimal implementation of the zodResolver used in React Hook Form.
 * This avoids pulling the @hookform/resolvers package, which is blocked
 * in the execution environment, while still providing equivalent behaviour
 * for parsing and error mapping.
 */
export function zodResolver<TSchema extends ZodTypeAny>(schema: TSchema): Resolver<InferSchema<TSchema>> {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return {
        values: result.data,
        errors: {}
      };
    }

    const formErrors = result.error.flatten();
    const fieldErrors = Object.fromEntries(
      Object.entries(formErrors.fieldErrors).map(([field, messages]) => [
        field,
        {
          type: 'manual',
          message: messages?.[0] ?? 'Valor inválido'
        }
      ])
    );

    return {
      values: {} as InferSchema<TSchema>,
      errors: fieldErrors
    };
  };
}
