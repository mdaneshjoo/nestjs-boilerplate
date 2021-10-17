import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/schemas/user.schema';
import { IUser } from '../user/user.interface';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { signUpErrEnum } from './auth.enum';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOne(email);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) return user;
    return null;
  }

  public login(user: User) {
    return this.createToken(user);
  }

  async create(user: IUser) {
    const existUser = this.userService.findOne(user.workEmail);
    if (existUser)
      throw new UnprocessableEntityException(
        signUpErrEnum.USER_DUPLICATE_MSG,
        signUpErrEnum.USER_DUPLICATE_CODE,
      );
  }

  private createToken(user: User) {
    const payload = { id: user['_id'], sub: user };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
