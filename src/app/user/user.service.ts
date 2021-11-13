import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { UpdateResult } from 'typeorm';
import { AppConfigService } from '../../config/app/config/config.service';
import { HttpLoggerService } from '../../shared/module/logger/http-logger.service';
import { MailService } from '../../shared/module/mail/mail.service';
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
    private mail: MailService,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    logger.path = UserService.name;
  }

  async findOne(workEmail: string, phoneNumber?: string): Promise<User> {
    let where: [
      email: { workEmail: string },
      phonenumber?: { phoneNumber: string },
    ] = [{ workEmail }];
    if (phoneNumber) where = [{ workEmail }, { phoneNumber }];
    return await this.userRepository.findOne({
      where,
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

    const newUser = this.userRepository.create(user);
    newUser.role = user.rolesId
      ? user.rolesId
      : await this.getRolesByName(ConstRoles.User.roleName);
    newUser.emailActive = this.appConfig.MODE === 'DEV';
    const createdUser = await this.userRepository.save(newUser);

    this.logger.debug('user created.', {
      workEmail: createdUser.workEmail,
      role: createdUser.role,
    });

    await this.mail.greetEmail(createdUser.workEmail, {
      confirmCode: createdUser.confirmCode,
      name: createdUser.firstName,
    });
    this.addTimeout(createdUser.workEmail, 15 * 60_000, createdUser);
    return createdUser;
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

  async saveForget(email: string, code: string): Promise<UpdateResult> {
    return this.userRepository.update(
      { workEmail: email },
      { forgetPassCode: code },
    );
  }

  addTimeout(name: string, milliseconds: number, user: User) {
    const callback = async () => {
      const findUser = await this.findOne(user.workEmail);
      if (!findUser.emailActive) await this.userRepository.remove(user);
    };

    const timeout = setTimeout(callback, milliseconds);
    this.schedulerRegistry.addTimeout(name, timeout);
  }

  public changePass(newPassword: string, user: User): Promise<UpdateResult> {
    return this.userRepository.update(
      { workEmail: user.workEmail },
      { password: newPassword },
    );
  }
}
