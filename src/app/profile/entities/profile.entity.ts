import { Column, Entity } from 'typeorm';
import { CommonEntity } from '../../../shared/entities/common.entity';

@Entity()
export class Profile extends CommonEntity {
  @Column()
  personalEmail: string;

  @Column()
  dob: Date;

  @Column()
  birthCertificationNumber: number;

  @Column()
  nationalIdNumber: number;

  @Column()
  // Place of birth
  pob: string;

  @Column()
  emergencyPhone: number;

  @Column()
  martialSituation: string;

  @Column()
  spouseName: string;

  @Column()
  childrenNumber: number;

  @Column()
  militaryServiceStatus: string;

  @Column()
  bloodType: string;

  @Column()
  mailingAddress: string;

  @Column()
  postalCode: number;
}
