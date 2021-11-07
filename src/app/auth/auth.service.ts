import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExtractJwt } from 'passport-jwt';
import { RolesService } from '../roles/roles.service';
import { User } from '../user/entities/user.entity';
import { UserRepository } from '../user/repositories/user.repository';
import { UserService } from '../user/user.service';
import { PayloadInterface } from './interfaces/auth.interface';
import fromAuthHeaderWithScheme = ExtractJwt.fromAuthHeaderWithScheme;

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

  public login(user: User) {
    return this.createToken(user);
  }

  private createToken(user: User) {
    const role = user.role.map((role) => {
      const permissions = role.permissions.map(({ permissionsName, id }) => ({
        id,
        permissionsName,
      }));
      return { id: role.id, roleName: role.roleName, permissions };
    });

    const payload = { id: user.id, sub: { role } };
    return {
      access_token: this.jwtService.sign(payload),
    };
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
}
