import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ExtractJwt } from 'passport-jwt';
import { UpdateResult } from 'typeorm';
import { MailService } from '../../shared/module/mail/mail.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import {
  ForgetPassConfirmErrorCodeEnum,
  ForgetPassConfirmErrorMsgEnum,
  ForgetPassConfirmSuccessMsgEnum,
  ForgetPassErrorCodeEnum,
  ForgetPassErrorMsgEnum,
} from './auth.enum';
import {
  ForgetPassConfirmBodyInterface,
  PayloadInterface,
  SignUpBodyInterface,
} from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mail: MailService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOne(email);
    if (!user || (user && !user.emailActive)) return null;
    const isMatch = await user.comparePassword(password);
    if (isMatch) return user;
    return null;
  }

  public login(user: User): string {
    return this.createToken(user);
  }

  /**
   * @desc create token for user
   * TODO: need to check if user not have permission dont allow to signup and revert creating user (transaction)
   * */
  private createToken(user: User): string {
    const role = user.role.map((role) => {
      const permissions = role.permissions.map(({ permissionsName, id }) => ({
        id,
        permissionsName,
      }));
      return { id: role.id, roleName: role.roleName, permissions };
    });

    const payload = { id: user.id, sub: { role } };
    return this.jwtService.sign(payload);
  }

  getUserPermissions(user: PayloadInterface): string[] {
    const permissions: string[] = [];
    if (user && user.sub.role.length)
      user.sub.role.map((role) => {
        if (role.permissions && role.permissions.length)
          role.permissions.map((perm) =>
            permissions.push(perm.permissionsName),
          );
      });
    return [...new Set(permissions)];
  }

  async signUp(bodyData: SignUpBodyInterface): Promise<void> {
    await this.userService.create(bodyData);
  }

  public async forgetPass(email: string): Promise<void> {
    const user = await this.userService.findOne(email);
    if (!user || (user && !user.emailActive))
      throw new UnprocessableEntityException(
        ForgetPassErrorMsgEnum.EMAIL_NOT_FOUND,
        ForgetPassErrorCodeEnum.EMAIL_NOT_FOUND,
      );
    const forgetCode = Math.random().toString().slice(-6);
    await this.userService.saveForget(email, forgetCode);
    await this.mail.forgetMail(email, forgetCode);
    this.addTimeout(user.workEmail, 60_000, email);
  }

  private addTimeout(name: string, milliseconds: number, email) {
    const callback = async () => {
      await this.userService.saveForget(email, null);
    };

    const timeout = setTimeout(callback, milliseconds);
    this.schedulerRegistry.addTimeout(name, timeout);
  }

  public async forgetPassConfirm(
    body: ForgetPassConfirmBodyInterface,
  ): Promise<UpdateResult> {
    const user = await this.userService.findOne(body.email);
    if (
      !user ||
      (user && !user.forgetPassCode) ||
      user.forgetPassCode !== body.code
    )
      throw new UnprocessableEntityException(
        ForgetPassConfirmErrorMsgEnum.INVALID_CONFIRM_CODE,
        ForgetPassConfirmErrorCodeEnum.INVALID_CONFIRM_CODE,
      );
    return this.userService.changePass(body.password, user);
  }
}
