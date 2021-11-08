import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { AppConfigService } from '../../config/app/config/config.service';
import { HttpLoggerService } from '../../shared/module/logger/http-logger.service';
import { Roles } from '../roles/entities/roles.entity';
import { ConstRoles } from '../roles/role.enum';
import { RolesService } from '../roles/roles.service';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

import { CreateUserErrCodeEnum, CreateUserErrMsgEnum } from './user.enum';
import { UserInterface } from './user.interface';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private appConfig: AppConfigService,
    private logger: HttpLoggerService,
    private roleService: RolesService,
  ) {
    logger.path = UserService.name;
  }

  async findOne(workEmail: string, phoneNumber?: string): Promise<User> {
    let where = null;
    if (phoneNumber) where = { phoneNumber };
    return await this.userRepository.findOne({
      where: [{ workEmail }, { ...where }],
      relations: ['role', 'role.permissions'],
    });
  }

  async create(user: UserInterface): Promise<User> {
    const existUser = await this.findOne(user.workEmail, user.phoneNumber);
    if (existUser)
      throw new UnprocessableEntityException(
        CreateUserErrMsgEnum.USER_DUPLICATE,
        CreateUserErrCodeEnum.USER_DUPLICATE,
      );
    if (!user.password) {
      user.password =
        this.appConfig.MODE === 'DEV'
          ? '123456789'
          : Math.random().toString().slice(-8);
      await this.sendEmail(user.password);
      user.needChangePassword = true;
    }
    const newUser = this.userRepository.create(user);
    newUser.role = user.rolesId
      ? user.rolesId
      : await this.getRolesByName(ConstRoles.User.roleName);
    const createdUser = await this.userRepository.save(newUser, {
      reload: true,
    });
    this.logger.debug('user created.', {
      workEmail: createdUser.workEmail,
      role: createdUser.role,
    });
    return await this.findOne(createdUser.workEmail);
  }

  private async getRolesByName(name: string): Promise<Array<Roles>> {
    const roles = await this.roleService.findByName([name]);
    if (!roles.length)
      throw new UnprocessableEntityException(
        CreateUserErrMsgEnum.ROLE_NOT_FOUND,
        CreateUserErrCodeEnum.ROLE_NOT_FOUND,
      );
    return roles;
  }

  async sendEmail(msg): Promise<void> {
    this.logger.debug('email sent', { msg });
  }
}
