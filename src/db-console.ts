import { Module } from '@nestjs/common';
import { CommandFactory } from 'nest-commander';
import { CreateDatabaseCommand } from './commands/db.command';
import { DataBaseConfigModule } from './config/database/config.module';

/**
 * Minimal root module for DB-bootstrap commands. Deliberately excludes
 * `AppModule` / `TypeOrmModule.forRoot` — otherwise TypeORM would attempt
 * to connect to `DB_NAME` during bootstrap, which fails when the database
 * we are about to create does not yet exist.
 */
@Module({
  imports: [DataBaseConfigModule],
  providers: [CreateDatabaseCommand],
})
class DbCliModule {}

async function bootstrap() {
  await CommandFactory.run(DbCliModule, ['warn', 'error']);
}

bootstrap();
