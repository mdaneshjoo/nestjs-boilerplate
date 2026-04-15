import { Injectable } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { Client } from 'pg';
import { DataBaseConfigService } from '../config/database/config.service';

/**
 * CLI command that creates the Postgres database named by `DB_NAME` if it
 * does not yet exist.
 *
 * How it works:
 *   1. Opens a connection to the server's built-in `postgres` maintenance
 *      database using `DB_HOST`/`DB_PORT`/`DB_USERNAME`/`DB_PASSWORD`.
 *   2. Queries `pg_database` to see whether a row with `datname = DB_NAME`
 *      already exists.
 *   3. If missing, issues `CREATE DATABASE "<name>"`. Identifier is
 *      double-quoted and its `"` characters are escaped manually because
 *      PostgreSQL disallows parameterized DDL for identifiers.
 *   4. Always closes the pg client.
 *
 * Invoke via: `npm run console -- db:create`
 */
@Injectable()
@Command({
  name: 'db:create',
  description: 'Create the database defined by DB_NAME (if missing).',
})
export class CreateDatabaseCommand extends CommandRunner {
  constructor(private readonly dbConfig: DataBaseConfigService) {
    super();
  }

  async run(): Promise<void> {
    const target = this.dbConfig.DB_NAME;
    const client = new Client({
      host: this.dbConfig.DB_HOST,
      port: this.dbConfig.DB_PORT,
      user: this.dbConfig.DB_USERNAME,
      password: this.dbConfig.DB_PASSWORD,
      database: 'postgres',
    });

    try {
      await client.connect();
      const { rowCount } = await client.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [target],
      );
      if (rowCount) {
        process.stdout.write(
          `✓ Database "${target}" already exists — nothing to do.\n`,
        );
        return;
      }
      const safeName = target.replace(/"/g, '""');
      await client.query(`CREATE DATABASE "${safeName}"`);
      process.stdout.write(`✓ Created database "${target}".\n`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(
        `✗ Failed to create database "${target}": ${message}\n`,
      );
      process.exitCode = 1;
    } finally {
      await client.end().catch(() => undefined);
    }
  }
}
