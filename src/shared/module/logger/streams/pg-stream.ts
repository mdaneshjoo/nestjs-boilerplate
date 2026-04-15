import { Pool, PoolConfig } from 'pg';
import { Writable } from 'stream';

/**
 * Construction options for {@link PgStream}.
 */
export interface PgStreamOptions {
  /** Credentials for the Postgres pool (a separate pool from TypeORM). */
  poolConfig: PoolConfig;
  /** Target log table name. Caller is responsible for passing a safe identifier. */
  table: string;
  /** Flush when the in-memory buffer reaches this many entries. */
  batchSize: number;
  /** Flush when this many milliseconds elapse since the first buffered entry. */
  flushMs: number;
}

/** Raw pino log record shape (only the fields we care about). */
interface LogEntry {
  time?: number;
  level?: number;
  msg?: string;
  context?: string;
  [key: string]: unknown;
}

/** Numeric pino level → human label. */
const LEVEL_LABELS: Record<number, string> = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal',
};

/**
 * Convert pino's numeric level to its label. Pino uses discrete multiples of
 * 10 but we fall back to the highest threshold that is ≤ the input so future
 * level additions don't misroute.
 */
function levelLabel(n: number | undefined): string {
  if (typeof n !== 'number') return 'info';
  for (const threshold of [60, 50, 40, 30, 20, 10]) {
    if (n >= threshold) return LEVEL_LABELS[threshold];
  }
  return 'trace';
}

/**
 * Writable stream for pino that batches JSON log lines and inserts them into
 * Postgres as multi-row `INSERT`s.
 *
 * How it works:
 *   1. Every `_write` parses the line and pushes it into an in-memory buffer.
 *   2. The buffer drains either when it hits {@link PgStreamOptions.batchSize}
 *      or when a `flushMs` timer fires after the first buffered entry.
 *   3. Flush builds one parameterised INSERT and fires-and-forgets. Errors
 *      are written to stderr and dropped — logging must never crash the app.
 *   4. On `_final` (process shutdown) we flush what remains and close the pool.
 *
 * The destination table is auto-created on construction (idempotent) so
 * deployments don't need a separate migration step.
 *
 * Schema:
 *   id      BIGSERIAL PRIMARY KEY
 *   ts      TIMESTAMPTZ  — entry timestamp
 *   level   VARCHAR(10)  — pino level label (info/warn/error/…)
 *   msg     TEXT         — pino `msg`
 *   context VARCHAR(255) — NestJS context/class name (optional)
 *   meta    JSONB        — remaining pino fields (req, res, user, etc.)
 */
export class PgStream extends Writable {
  private buffer: LogEntry[] = [];
  private timer: NodeJS.Timeout | null = null;
  private readonly pool: Pool;
  private readonly ready: Promise<void>;

  constructor(private readonly opts: PgStreamOptions) {
    super({ decodeStrings: false });
    this.pool = new Pool({ ...opts.poolConfig, max: 2 });
    process.stderr.write(
      `[PgStream] initialising → host=${opts.poolConfig.host} db=${opts.poolConfig.database} table=${opts.table}\n`,
    );
    this.ready = this.ensureTable()
      .then(() => {
        process.stderr.write(
          `[PgStream] ready → table "${opts.table}" ensured\n`,
        );
      })
      .catch((err) => {
        process.stderr.write(
          `[PgStream] FAILED to initialise log table "${opts.table}": ${err instanceof Error ? err.stack ?? err.message : err}\n`,
        );
        throw err;
      });
  }

  /**
   * Idempotently create the log table and supporting indexes. Called once per
   * stream instance.
   */
  private async ensureTable(): Promise<void> {
    const table = this.opts.table;
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${table} (
        id BIGSERIAL PRIMARY KEY,
        ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        level VARCHAR(10) NOT NULL,
        msg TEXT NOT NULL DEFAULT '',
        context VARCHAR(255),
        meta JSONB
      )
    `);
    await this.pool.query(
      `CREATE INDEX IF NOT EXISTS idx_${table}_ts ON ${table}(ts)`,
    );
    await this.pool.query(
      `CREATE INDEX IF NOT EXISTS idx_${table}_level ON ${table}(level)`,
    );
  }

  /**
   * Called by pino for every log line. Parses, buffers, and either flushes
   * immediately (when full) or arms the flush timer.
   */
  _write(
    chunk: Buffer | string,
    _enc: BufferEncoding,
    cb: (err?: Error | null) => void,
  ): void {
    try {
      const line = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
      const entry = JSON.parse(line) as LogEntry;
      this.buffer.push(entry);
      if (this.buffer.length >= this.opts.batchSize) {
        void this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => void this.flush(), this.opts.flushMs);
      }
    } catch {
      // Swallow malformed lines — never fail a log write.
    }
    cb();
  }

  /** Graceful shutdown: flush everything and close the pool. */
  async _final(cb: (err?: Error | null) => void): Promise<void> {
    await this.flush().catch(() => undefined);
    await this.pool.end().catch(() => undefined);
    cb();
  }

  /**
   * Drain the buffer into a single multi-row INSERT. Errors are reported to
   * stderr and swallowed so that a logging failure never propagates.
   */
  private async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (!this.buffer.length) return;
    const batch = this.buffer.splice(0, this.buffer.length);
    try {
      await this.ready;
      const params: unknown[] = [];
      const placeholders: string[] = [];
      batch.forEach((entry, i) => {
        const base = i * 5;
        placeholders.push(
          `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`,
        );
        const { time, level, msg, context, ...rest } = entry;
        params.push(
          new Date(typeof time === 'number' ? time : Date.now()),
          levelLabel(typeof level === 'number' ? level : undefined),
          typeof msg === 'string' ? msg : '',
          typeof context === 'string' ? context : null,
          JSON.stringify(rest),
        );
      });
      await this.pool.query(
        `INSERT INTO ${this.opts.table} (ts, level, msg, context, meta) VALUES ${placeholders.join(',')}`,
        params,
      );
    } catch (err) {
      process.stderr.write(
        `[PgStream] flush failed: ${err instanceof Error ? err.message : err}\n`,
      );
    }
  }
}
