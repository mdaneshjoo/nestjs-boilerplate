import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy as Jwt_Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Jwt_Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'test',
    });
  }
  async validate(payload) {
    return payload;
  }
}
