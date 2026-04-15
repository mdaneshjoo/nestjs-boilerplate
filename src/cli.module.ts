import { Module } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrivilegesModule } from './commands/privileges.module';

@Module({
  imports: [AppModule, PrivilegesModule],
})
export class CliModule {}
