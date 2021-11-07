import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { CommonEntity } from '../../../shared/entities/common.entity';
import { Permissions } from './permissions.entity';

@Entity()
export class Roles extends CommonEntity {
  @Column({ unique: true, nullable: false })
  roleName?: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Permissions)
  @JoinTable()
  permissions?: Permissions[];
}
