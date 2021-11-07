import { Column, Entity } from 'typeorm';
import { CommonEntity } from '../../../../shared/entities/common.entity';

@Entity()
export class Credit extends CommonEntity {
  @Column({ nullable: true })
  creditId: number;

  @Column({ nullable: true })
  isCreditEditable: boolean;

  @Column({ nullable: true })
  shaba: number;

  @Column({ nullable: true })
  salary: number;
}
