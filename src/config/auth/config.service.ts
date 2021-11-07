import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthConfigService {
  constructor(private configService: ConfigService) {}
  get SECRET(): string {
    return this.configService.get<string>('Auth.SECRET');
  }
  /**
   * @desc this number is hours if pass 5 token will expire in 5 hours
   * */
  get EXPIRE(): string {
    return this.configService.get<string>('Auth.EXPIRE');
  }
}
