import { Column, Entity } from 'typeorm';
import { CommonEntity } from '../../../shared/entities/common.entity';

@Entity()
export class Permissions extends CommonEntity {
  @Column({ unique: true })
  permissionsName?: string;

  @Column({ nullable: true })
  description?: string;
}
