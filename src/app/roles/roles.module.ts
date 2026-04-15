import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permissions } from './entities/permissions.entity';
import { Roles } from './entities/roles.entity';
import { PermissionsRepository } from './repositories/permissions.repository';
import { RolesRepository } from './repositories/roles.repository';
import { RolesService } from './roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Roles, Permissions])],
  providers: [RolesService, RolesRepository, PermissionsRepository],
  exports: [RolesService, RolesRepository, PermissionsRepository],
})
export class RolesModule {}
