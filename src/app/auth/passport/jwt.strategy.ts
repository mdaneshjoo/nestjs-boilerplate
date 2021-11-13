import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy as Jwt_Strategy } from 'passport-jwt';
import { AuthConfigService } from '../../../config/auth/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Jwt_Strategy) {
  constructor(private configService: AuthConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.SECRET,
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(payload: any) {
    return payload;
  }
}
