import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExtractJwt } from 'passport-jwt';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import {
  PayloadInterface,
  SignUpBodyInterface,
} from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOne(email);
    if (!user) return null;
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

  async signUp(bodyData: SignUpBodyInterface): Promise<string> {
    const user = await this.userService.create(bodyData);
    return this.createToken(user);
  }
}
