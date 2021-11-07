import { Injectable } from '@nestjs/common';
import { Roles } from './entities/roles.entity';
import { RolesRepository } from './repositories/roles.repository';

@Injectable()
export class RolesService {
  constructor(private roleRepository: RolesRepository) {}

  async create(role: Roles): Promise<Roles> {
    const { result: createdRole } = await this.roleRepository.findOrCreate(
      { roleName: role.roleName },
      role,
    );
    return createdRole;
  }
}
