import { DeepPartial, EntityRepository, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { User } from '../entities/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
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
