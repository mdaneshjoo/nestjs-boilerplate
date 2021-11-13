import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsoleModule } from '@squareboat/nest-console';
import { PermissionsRepository } from '../app/roles/repositories/permissions.repository';
import { RolesRepository } from '../app/roles/repositories/roles.repository';
import { UserModule } from '../app/user/user.module';
import { PrivilegesCommands } from './privileges.command';

@Module({
  imports: [
    ConsoleModule,
    UserModule,
    TypeOrmModule.forFeature([RolesRepository, PermissionsRepository]),
  ],
  providers: [PrivilegesCommands],
})
export class PrivilegesModule {}
