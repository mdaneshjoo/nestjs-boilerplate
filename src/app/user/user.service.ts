import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { empty } from 'rxjs';
import { FindOneOptions } from 'typeorm';
import { AppConfigService } from '../../config/app/config/config.service';
import { Roles } from '../roles/entities/roles.entity';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

import { CreateUserErrEnum } from './user.enum';
import { UserInterface } from './user.interface';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private appConfig: AppConfigService,
  ) {}

  async findOne(workEmail: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { workEmail },
      relations: ['role', 'role.permissions'],
    });
  }

  async create(user: UserInterface): Promise<User> {
    const existUser = await this.findOne(user.workEmail);
    if (existUser)
      throw new UnprocessableEntityException(
        CreateUserErrEnum.USER_DUPLICATE_MSG,
        CreateUserErrEnum.USER_DUPLICATE_CODE,
      );
    if (!user.password)
      user.password =
        this.appConfig.MODE === 'DEV'
          ? '123456789'
          : Math.random().toString().slice(-8);
    const newUser = this.userRepository.create(user);
    newUser.role = user.rolesId;
    return this.userRepository.save(newUser);
  }
}
