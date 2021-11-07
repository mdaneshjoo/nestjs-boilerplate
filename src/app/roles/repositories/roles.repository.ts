import {
  DeepPartial,
  EntityRepository,
  FindConditions,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Roles } from '../entities/roles.entity';

@EntityRepository(Roles)
export class RolesRepository extends Repository<Roles> {
  async findOrCreate(
    criteria: FindConditions<Roles>,
    role: QueryDeepPartialEntity<Roles> | QueryDeepPartialEntity<Roles>[],
  ): Promise<FindOrCreateResult<Roles>> {
    const foundRole = await this.findOne({ where: criteria });
    if (foundRole) return { created: false, result: foundRole };
    const createdRole = await this.insertReturning<Roles>(role);
    return { created: true, result: createdRole };
  }

  async insertReturning<T>(
    role: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
  ) {
    const createdRole = await this.createQueryBuilder()
      .insert()
      .values(role)
      .returning('*')
      .execute();
    return this.create(createdRole.generatedMaps[0] as DeepPartial<T>);
  }
}

export interface FindOrCreateResult<T> {
  created: boolean;
  result: T;
}
