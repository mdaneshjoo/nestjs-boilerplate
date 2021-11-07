import { Injectable } from '@nestjs/common';
import { Command } from '@squareboat/nest-console';
import { _cli } from '@squareboat/nest-console';
import * as Joi from 'joi';
import { PermissionsEnum } from '../app/auth/permissions/permissions.enum';
import { Permissions } from '../app/roles/entities/permissions.entity';
import { PermissionsRepository } from '../app/roles/repositories/permissions.repository';
import {
  FindOrCreateResult,
  RolesRepository,
} from '../app/roles/repositories/roles.repository';
import { ConstRoles, CreateUserErrEnum } from '../app/user/user.enum';
import { UserService } from '../app/user/user.service';

@Injectable()
export class PrivilegesCommands {
  constructor(
    private userService: UserService,
    private roleRepository: RolesRepository,
    private permissionRepository: PermissionsRepository,
  ) {}

  @Command('create:superuser', { desc: 'create a super user' })
  async createSuperUser() {
    try {
      const email = await PrivilegesCommands.getEmail();
      const existUser = await this.userService.findOne(email);
      if (existUser) throw new Error(CreateUserErrEnum.USER_DUPLICATE_MSG);
      const role = await this.createAdminRole();
      await this.userService.create({
        workEmail: email,
        firstName: 'SuperUser',
        createdBy: 0,
        rolesId: [{ id: role.id }],
      });
      _cli.info('password sent to your email');
      _cli.success('superUser is created!');
    } catch (e) {
      return _cli.error(e.message);
    }
  }
  @Command('create:permissions', { desc: 'create all permissions' })
  async saveAllPermissions() {
    let i = 0;
    for (const permission in PermissionsEnum) {
      const { created } = await this.createPermissions({
        permissionsName: PermissionsEnum[permission],
        createdBy: 0,
      });
      _cli.info(
        created
          ? `Permission ${PermissionsEnum[permission]} created!`
          : `Permission ${PermissionsEnum[permission]} already exist!`,
      );
      if (created) i++;
    }
    _cli.success(
      i
        ? `All (${i}) Permissions Created!`
        : 'Permissions already is up to date',
    );
  }

  private async createAdminRole() {
    const { result: permission } = await this.createPermissions({
      permissionsName: PermissionsEnum.MANAGE,
      description: 'can do anything',
      createdBy: 0,
    });
    const { result: role } = await this.roleRepository.findOrCreate(
      { roleName: ConstRoles.Admin.roleName },
      ConstRoles.Admin,
    );

    role.permissions = [permission];
    return await this.roleRepository.save(role);
  }

  private async createPermissions(
    permission: Permissions,
  ): Promise<FindOrCreateResult<Permissions>> {
    return await this.permissionRepository.findOrCreate(
      {
        permissionsName: permission.permissionsName,
      },
      permission,
    );
  }

  private static async getEmail(): Promise<string> {
    const emailSchema = Joi.object({
      workEmail: Joi.string().email().required(),
    });

    const email = await _cli.ask('workEmail (pleas use valid email):');
    const { error } = emailSchema.validate({ workEmail: email });

    if (error) throw new Error(error.message);

    return email;
  }
}
