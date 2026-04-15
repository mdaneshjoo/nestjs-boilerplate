import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { FindOptionsWhere, UpdateResult } from 'typeorm';
import { AppConfigService } from '../../config/app/config/config.service';
import { HttpLoggerService } from '../../shared/module/logger/http-logger.service';
import { NotificationChannel } from '../../shared/module/notification/notification.enum';
import { NotificationService } from '../../shared/module/notification/notification.service';
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
    private notifications: NotificationService,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    logger.path = UserService.name;
  }

  async findOne(workEmail: string, phoneNumber?: string): Promise<User> {
    const where: FindOptionsWhere<User>[] = phoneNumber
      ? [{ workEmail }, { phoneNumber }]
      : [{ workEmail }];
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

    await this.sendGreetingEmail(createdUser);
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

  private async sendGreetingEmail(user: User): Promise<void> {
    const appName = this.appConfig.APP_NAME;
    const confirmUrl = `${this.appConfig.CLIENT_URL}/${user.confirmCode}`;
    await this.notifications.send({
      channels: [NotificationChannel.EMAIL],
      recipient: { email: user.workEmail, userId: user.id },
      payload: {
        subject: `${appName} Greeting`,
        body: `Hello ${user.firstName}. Welcome to ${appName}. Confirm your email: ${confirmUrl}`,
        html: `
          <p>Hello ${user.firstName}</p>
          <p>Welcome To ${appName}</p>
          <p>Note: For completing your signup you should confirm your email. Please press the CONFIRM button.</p>
          <p>Attention! This link expires in 15 minutes.</p>
          <p><a href="${confirmUrl}">CONFIRM</a></p>
        `,
      },
    });
  }
}
