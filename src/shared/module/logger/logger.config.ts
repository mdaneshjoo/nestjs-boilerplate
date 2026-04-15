import { z } from 'zod';

/**
 * Accepted pino levels, plus `off` to disable a destination entirely.
 * A destination at level "warn" receives warn/error/fatal (pino's standard
 * minimum-level semantics), not only warn.
 */
export const LOG_LEVELS = [
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
] as const;

const levelSchema = z.union([z.enum(LOG_LEVELS), z.literal('off')]);

/**
 * Zod schema for log-related environment variables. All variables have
 * defaults, so nothing is strictly required — callers only set what they
 * want to override.
 */
export const loggerEnvSchema = z.object({
  LOG_LEVEL_CONSOLE: levelSchema.default('info'),
  LOG_LEVEL_FILE: levelSchema.default('warn'),
  LOG_LEVEL_DB: levelSchema.default('off'),
  LOG_FILE_DIR: z.string().default('logs'),
  LOG_FILE_ROTATE_SIZE: z.string().default('30m'),
  LOG_FILE_ROTATE_FREQUENCY: z.enum(['daily', 'hourly']).default('daily'),
  LOG_DB_TABLE: z
    .string()
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/)
    .default('app_logs'),
  LOG_DB_BATCH_SIZE: z.coerce.number().int().positive().default(100),
  LOG_DB_FLUSH_MS: z.coerce.number().int().positive().default(1000),
});

export type LoggerEnv = z.infer<typeof loggerEnvSchema>;

/**
 * Parse `process.env` into a typed logger config. Invalid values throw a
 * standard Zod error — we don't wrap with {@link validateEnv} here because
 * the logger must initialise before the rest of the app, and we want the
 * stack trace to be loud if something is wrong.
 *
 * @param env - an env-like record, defaults to `process.env`.
 * @returns fully-defaulted {@link LoggerEnv}.
 */
export function loadLoggerEnv(
  env: NodeJS.ProcessEnv = process.env,
): LoggerEnv {
  return loggerEnvSchema.parse(env);
}
