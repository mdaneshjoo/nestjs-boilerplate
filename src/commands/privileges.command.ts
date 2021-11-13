import { Injectable, Scope } from '@nestjs/common';
import { _cli, Command } from '@squareboat/nest-console';
import * as Joi from 'joi';
import { Permissions } from '../app/roles/entities/permissions.entity';
import { Roles } from '../app/roles/entities/roles.entity';
import {
  DefaultRolePermissionsEnum,
  PermissionsEnum,
} from '../app/roles/permissions.enum';
import { PermissionsRepository } from '../app/roles/repositories/permissions.repository';
import {
  FindOrCreateResult,
  RolesRepository,
} from '../app/roles/repositories/roles.repository';
import { ConstRoles } from '../app/roles/role.enum';
import { CreateUserErrMsgEnum } from '../app/user/user.enum';
import { UserService } from '../app/user/user.service';

@Injectable({ scope: Scope.DEFAULT })
export class PrivilegesCommands {
  constructor(
    private userService: UserService,
    private roleRepository: RolesRepository,
    private permissionRepository: PermissionsRepository,
  ) {}

  @Command('create:superuser', { desc: 'create a super user' })
  async createSuperUser() {
    try {
      const { email, password } = await PrivilegesCommands.getEmail();
      const existUser = await this.userService.findOne(email);
      if (existUser) throw new Error(CreateUserErrMsgEnum.USER_DUPLICATE);
      const role = await this.createRole(
        ConstRoles.Admin.roleName,
        ConstRoles.Admin,
        PermissionsEnum.MANAGE,
        'can do anything',
      );
      await this.userService.create({
        workEmail: email,
        firstName: 'SuperUser',
        createdBy: 0,
        password,
        rolesId: [{ id: role.id }],
      });
      _cli.success('superUser is created!');
      _cli.info(
        'we have sent you a confirmation link to your email .you have only 15 minute to use it',
      );
    } catch (e) {
      return _cli.error(e.message);
    }
  }
  @Command('create:permissions', { desc: 'create all permissions' })
  async saveAllPermissions() {
    try {
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
    } catch (e) {
      console.log(e);
    }
  }

  @Command('create:default-role')
  async createDefaultRole() {
    let i = 0;
    let createdRole;
    for (const permission in DefaultRolePermissionsEnum) {
      const role = await this.createRole(
        ConstRoles.User.roleName,
        ConstRoles.User,
        DefaultRolePermissionsEnum[permission],
        '',
      );
      if (i === 0) createdRole = role.roleName;
      i++;
      _cli.info(
        `Permission ${DefaultRolePermissionsEnum[permission]} assigned to role ${role.roleName}`,
      );
    }
    _cli.success(`Default role (${createdRole}) created!`);
    _cli.success(`All (${i}) Permissions assigned to default role !`);
  }

  private async createRole(
    roleName: string,
    roleData: Roles,
    permissionName: string,
    permissionsDesc: string,
  ) {
    const { result: permission } = await this.createPermissions({
      permissionsName: permissionName,
      description: permissionsDesc,
      createdBy: 0,
    });
    const { result: role } = await this.roleRepository.findOrCreate(
      { roleName: roleName },
      roleData,
    );

    role.permissions = [permission];
    return await this.roleRepository.save(role);
  }

  /**
   * @desc if permission not exist will created it else return exist permission
   * */
  async createPermissions(
    permission: Permissions,
  ): Promise<FindOrCreateResult<Permissions>> {
    return await this.permissionRepository.findOrCreate(
      {
        permissionsName: permission.permissionsName,
      },
      permission,
    );
  }
  private static async getEmail(): Promise<{
    email: string;
    password: string;
  }> {
    const emailSchema = Joi.object({
      workEmail: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    const email = await _cli.ask('workEmail (pleas use valid email):');
    const password = await _cli.password('password:');
    const { error } = emailSchema.validate({ workEmail: email, password });

    if (error) throw new Error(error.message);

    return {
      email,
      password,
    };
  }
}
