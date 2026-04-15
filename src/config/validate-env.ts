import { ZodSchema } from 'zod';

export function validateEnv<T>(schema: ZodSchema<T>) {
  return (env: Record<string, unknown>): T => {
    const result = schema.safeParse(env);
    if (result.success) return result.data;

    const lines = result.error.issues.map((i) => {
      const path = i.path.join('.') || '(root)';
      return `  • ${path}: ${i.message}`;
    });
    throw new Error(`Invalid environment configuration:\n${lines.join('\n')}`);
  };
}
