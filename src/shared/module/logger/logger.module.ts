import { Global, Module, RequestMethod } from '@nestjs/common';
import { LoggerModule as PinoModule } from 'nestjs-pino';
import pino from 'pino';
import pretty from 'pino-pretty';
import pinoRoll from 'pino-roll';
import { AppConfigModule } from '../../../config/app/config/config.module';
import { AppConfigService } from '../../../config/app/config/config.service';
import { DataBaseConfigModule } from '../../../config/database/config.module';
import { DataBaseConfigService } from '../../../config/database/config.service';
import { loadLoggerEnv } from './logger.config';
import { DEFAULT_REDACT_PATHS, REDACT_CENSOR } from './redact';
import { PgStream } from './streams/pg-stream';

/**
 * Global logger module.
 *
 * Pipeline:
 *   - `nestjs-pino` wires `pino-http` into the request cycle so every HTTP
 *     call produces a structured log entry.
 *   - A single underlying pino instance feeds a `pino.multistream` that fans
 *     entries out to every enabled destination (console / file / pg).
 *   - Each destination's minimum level is driven by env vars
 *     (`LOG_LEVEL_CONSOLE`, `LOG_LEVEL_FILE`, `LOG_LEVEL_DB`). Setting a
 *     variable to `off` removes that destination from the multistream.
 *   - Redaction is applied once by pino *before* serialisation, so sensitive
 *     fields never reach any destination.
 *
 * Console is always included unless explicitly `off` so the developer never
 * has to tail a file to see what the service is doing.
 */
@Global()
@Module({
  imports: [
    PinoModule.forRootAsync({
      imports: [AppConfigModule, DataBaseConfigModule],
      useFactory: async (
        appConfig: AppConfigService,
        dbConfig: DataBaseConfigService,
      ) => {
        const cfg = loadLoggerEnv();
        process.stderr.write(
          `[Logger] console=${cfg.LOG_LEVEL_CONSOLE} file=${cfg.LOG_LEVEL_FILE} db=${cfg.LOG_LEVEL_DB}\n`,
        );
        const streams: { level: string; stream: NodeJS.WritableStream }[] = [];

        // ── Console ────────────────────────────────────────────────
        if (cfg.LOG_LEVEL_CONSOLE !== 'off') {
          const consoleStream: NodeJS.WritableStream =
            appConfig.MODE === 'DEV'
              ? pretty({ singleLine: true, colorize: true })
              : process.stdout;
          streams.push({
            level: cfg.LOG_LEVEL_CONSOLE,
            stream: consoleStream,
          });
        }

        // ── File ───────────────────────────────────────────────────
        if (cfg.LOG_LEVEL_FILE !== 'off') {
          const fileStream = await pinoRoll({
            file: `${cfg.LOG_FILE_DIR}/app`,
            extension: '.log',
            frequency: cfg.LOG_FILE_ROTATE_FREQUENCY,
            size: cfg.LOG_FILE_ROTATE_SIZE,
            mkdir: true,
          });
          streams.push({ level: cfg.LOG_LEVEL_FILE, stream: fileStream });
        }

        // ── Postgres ───────────────────────────────────────────────
        if (cfg.LOG_LEVEL_DB !== 'off') {
          const pg = new PgStream({
            poolConfig: {
              host: dbConfig.DB_HOST,
              port: dbConfig.DB_PORT,
              user: dbConfig.DB_USERNAME,
              password: dbConfig.DB_PASSWORD,
              database: dbConfig.DB_NAME,
            },
            table: cfg.LOG_DB_TABLE,
            batchSize: cfg.LOG_DB_BATCH_SIZE,
            flushMs: cfg.LOG_DB_FLUSH_MS,
          });
          streams.push({ level: cfg.LOG_LEVEL_DB, stream: pg });
        }

        const multistream = pino.multistream(streams, { dedupe: false });

        return {
          // Override nestjs-pino's default `path: '*'` which path-to-regexp
          // v8 (Express 5) no longer accepts. Named wildcard is required.
          forRoutes: [{ path: '*path', method: RequestMethod.ALL }],
          exclude: [],
          pinoHttp: {
            level: 'debug',
            redact: {
              paths: DEFAULT_REDACT_PATHS,
              censor: REDACT_CENSOR,
            },
            stream: multistream,
          },
        };
      },
      inject: [AppConfigService, DataBaseConfigService],
    }),
  ],
  exports: [PinoModule],
})
export class CustomLoggerModule {}
