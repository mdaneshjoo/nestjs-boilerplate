import { Injectable } from '@nestjs/common';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async insertReturning<T>(
    role: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
  ) {
    const createdRole = await this.createQueryBuilder()
      .insert()
      .values(role)
      .returning('*')
      .execute();
    return this.create(createdRole.generatedMaps[0] as DeepPartial<User>);
  }
}
