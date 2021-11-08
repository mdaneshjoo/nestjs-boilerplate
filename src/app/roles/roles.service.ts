import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { Roles } from './entities/roles.entity';
import { PermissionsRepository } from './repositories/permissions.repository';
import { RolesRepository } from './repositories/roles.repository';

@Injectable()
export class RolesService {
  constructor(
    private roleRepository: RolesRepository,
    private permissionRepository: PermissionsRepository,
  ) {}
  /**
   * @desc if role not exist created it else return exist role
   * */
  async create(role: Roles): Promise<Roles> {
    const { result: createdRole } = await this.roleRepository.findOrCreate(
      { roleName: role.roleName },
      role,
    );
    return createdRole;
  }

  /**
   * @desc find  roles by its name without relation
   * */
  async findByName(names: string[]): Promise<Roles[]> {
    return await this.roleRepository.find({
      where: { roleName: In(names) },
    });
  }
}
