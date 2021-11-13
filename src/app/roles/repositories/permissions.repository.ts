import {
  DeepPartial,
  EntityRepository,
  FindConditions,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Permissions } from '../entities/permissions.entity';
import { FindOrCreateResult } from './roles.repository';

@EntityRepository(Permissions)
export class PermissionsRepository extends Repository<Permissions> {
  async findOrCreate(
    criteria: FindConditions<Permissions>,
    data:
      | QueryDeepPartialEntity<Permissions>
      | QueryDeepPartialEntity<Permissions>[],
  ): Promise<FindOrCreateResult<Permissions>> {
    const foundResult = await this.findOne({ where: criteria });
    if (foundResult) return { created: false, result: foundResult };
    const createdResult = await this.insertReturning<Permissions>(data);
    return { created: true, result: createdResult };
  }

  async insertReturning<T>(
    data: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
  ) {
    const created = await this.createQueryBuilder()
      .insert()
      .values(data)
      .returning('*')
      .execute();
    return this.create(created.generatedMaps[0] as DeepPartial<T>);
  }
}
