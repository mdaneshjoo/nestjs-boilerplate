import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from '../../user/schemas/user.schema';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'workEmail' });
  }

  async validate(workEmail: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(workEmail, password);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
