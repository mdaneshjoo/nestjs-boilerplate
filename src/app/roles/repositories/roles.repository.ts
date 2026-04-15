import { Injectable } from '@nestjs/common';
import { DataSource, DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Roles } from '../entities/roles.entity';

@Injectable()
export class RolesRepository extends Repository<Roles> {
  constructor(dataSource: DataSource) {
    super(Roles, dataSource.createEntityManager());
  }

  async findOrCreate(
    criteria: FindOptionsWhere<Roles>,
    role: QueryDeepPartialEntity<Roles> | QueryDeepPartialEntity<Roles>[],
  ): Promise<FindOrCreateResult<Roles>> {
    const foundRole = await this.findOne({ where: criteria });
    if (foundRole) return { created: false, result: foundRole };
    const createdRole = await this.insertReturning(role);
    return { created: true, result: createdRole };
  }

  async insertReturning(
    role: QueryDeepPartialEntity<Roles> | QueryDeepPartialEntity<Roles>[],
  ) {
    const createdRole = await this.createQueryBuilder()
      .insert()
      .values(role)
      .returning('*')
      .execute();
    return this.create(createdRole.generatedMaps[0] as DeepPartial<Roles>);
  }
}

export interface FindOrCreateResult<T> {
  created: boolean;
  result: T;
}
