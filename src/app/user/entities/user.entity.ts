import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { AppConfigService } from '../../../config/app/config/config.service';
import { CommonEntity } from '../../../shared/entities/common.entity';
import { Roles } from '../../roles/entities/roles.entity';

@Entity()
export class User extends CommonEntity {
  @Column({ default: 'Guest' })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  nickName: string;

  @Column({ nullable: false, unique: true })
  workEmail: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  joinDate: Date;

  /**
   * @desc this use for auto generated passwords if its ture user should change password
   * */
  @Column({ default: false })
  needChangePassword: boolean;

  @Column({ default: false })
  emailActive: boolean;

  @Column({ nullable: true })
  forgetPassCode: string;

  @Column({ nullable: true })
  confirmCode: string;

  @ManyToMany(() => Roles)
  @JoinTable()
  role: Roles[];

  async comparePassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password);
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @BeforeInsert()
  async beforeInsert() {
    this.confirmCode = randomStringGenerator();
  }
}
