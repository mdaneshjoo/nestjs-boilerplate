import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import {
  Command,
  CommandRunner,
  InquirerService,
  Question,
  QuestionSet,
} from 'nest-commander';
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

@QuestionSet({ name: 'super-user' })
export class SuperUserQuestions {
  @Question({ message: 'workEmail (please use valid email):', name: 'email' })
  parseEmail(val: string) {
    return val;
  }

  @Question({ message: 'password:', name: 'password', type: 'password' })
  parsePassword(val: string) {
    return val;
  }
}

@Injectable()
@Command({ name: 'create:superuser', description: 'create a super user' })
export class CreateSuperUserCommand extends CommandRunner {
  constructor(
    private userService: UserService,
    private roleRepository: RolesRepository,
    private permissionRepository: PermissionsRepository,
    private readonly inquirer: InquirerService,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      const { email, password } = await this.inquirer.ask<{
        email: string;
        password: string;
      }>('super-user', undefined);

      const schema = z.object({
        workEmail: z.string().email(),
        password: z.string().min(1),
      });
      const parsed = schema.safeParse({ workEmail: email, password });
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);

      const existUser = await this.userService.findOne(email);
      if (existUser) throw new Error(CreateUserErrMsgEnum.USER_DUPLICATE);

      const role = await createRole(
        this.permissionRepository,
        this.roleRepository,
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
      console.log('superUser is created!');
      console.log(
        'we have sent you a confirmation link to your email. you have only 15 minute to use it',
      );
    } catch (e) {
      console.error(e.message);
    }
  }
}

@Injectable()
@Command({
  name: 'create:permissions',
  description: 'create all permissions',
})
export class CreatePermissionsCommand extends CommandRunner {
  constructor(private permissionRepository: PermissionsRepository) {
    super();
  }

  async run(): Promise<void> {
    try {
      let i = 0;
      for (const permission in PermissionsEnum) {
        const { created } = await createPermissions(this.permissionRepository, {
          permissionsName: PermissionsEnum[permission],
          createdBy: 0,
        });
        console.log(
          created
            ? `Permission ${PermissionsEnum[permission]} created!`
            : `Permission ${PermissionsEnum[permission]} already exist!`,
        );
        if (created) i++;
      }
      console.log(
        i
          ? `All (${i}) Permissions Created!`
          : 'Permissions already is up to date',
      );
    } catch (e) {
      console.log(e);
    }
  }
}

@Injectable()
@Command({ name: 'create:default-role', description: 'create default role' })
export class CreateDefaultRoleCommand extends CommandRunner {
  constructor(
    private roleRepository: RolesRepository,
    private permissionRepository: PermissionsRepository,
  ) {
    super();
  }

  async run(): Promise<void> {
    let i = 0;
    let createdRole: string;
    for (const permission in DefaultRolePermissionsEnum) {
      const role = await createRole(
        this.permissionRepository,
        this.roleRepository,
        ConstRoles.User.roleName,
        ConstRoles.User,
        DefaultRolePermissionsEnum[permission],
        '',
      );
      if (i === 0) createdRole = role.roleName;
      i++;
      console.log(
        `Permission ${DefaultRolePermissionsEnum[permission]} assigned to role ${role.roleName}`,
      );
    }
    console.log(`Default role (${createdRole}) created!`);
    console.log(`All (${i}) Permissions assigned to default role !`);
  }
}

async function createRole(
  permissionRepository: PermissionsRepository,
  roleRepository: RolesRepository,
  roleName: string,
  roleData: Roles,
  permissionName: string,
  permissionsDesc: string,
) {
  const { result: permission } = await createPermissions(permissionRepository, {
    permissionsName: permissionName,
    description: permissionsDesc,
    createdBy: 0,
  });
  const { result: role } = await roleRepository.findOrCreate(
    { roleName: roleName },
    roleData,
  );
  role.permissions = [permission];
  return await roleRepository.save(role);
}

async function createPermissions(
  permissionRepository: PermissionsRepository,
  permission: Permissions,
): Promise<FindOrCreateResult<Permissions>> {
  return await permissionRepository.findOrCreate(
    { permissionsName: permission.permissionsName },
    permission,
  );
}

export const PRIVILEGE_COMMANDS = [
  CreateSuperUserCommand,
  CreatePermissionsCommand,
  CreateDefaultRoleCommand,
  SuperUserQuestions,
];
