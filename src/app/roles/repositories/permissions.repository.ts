import { Injectable } from '@nestjs/common';
import { DataSource, DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Permissions } from '../entities/permissions.entity';
import { FindOrCreateResult } from './roles.repository';

@Injectable()
export class PermissionsRepository extends Repository<Permissions> {
  constructor(dataSource: DataSource) {
    super(Permissions, dataSource.createEntityManager());
  }

  async findOrCreate(
    criteria: FindOptionsWhere<Permissions>,
    data:
      | QueryDeepPartialEntity<Permissions>
      | QueryDeepPartialEntity<Permissions>[],
  ): Promise<FindOrCreateResult<Permissions>> {
    const foundResult = await this.findOne({ where: criteria });
    if (foundResult) return { created: false, result: foundResult };
    const createdResult = await this.insertReturning(data);
    return { created: true, result: createdResult };
  }

  async insertReturning(
    data:
      | QueryDeepPartialEntity<Permissions>
      | QueryDeepPartialEntity<Permissions>[],
  ) {
    const created = await this.createQueryBuilder()
      .insert()
      .values(data)
      .returning('*')
      .execute();
    return this.create(created.generatedMaps[0] as DeepPartial<Permissions>);
  }
}
