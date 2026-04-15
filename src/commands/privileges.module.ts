import { Module } from '@nestjs/common';
import { RolesModule } from '../app/roles/roles.module';
import { UserModule } from '../app/user/user.module';
import { PRIVILEGE_COMMANDS } from './privileges.command';

@Module({
  imports: [UserModule, RolesModule],
  providers: [...PRIVILEGE_COMMANDS],
})
export class PrivilegesModule {}
