import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type Mode = 'DEV' | 'PROD';
@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}
  get PORT(): number {
    return this.configService.get<number>('App.PORT');
  }
  get MODE(): Mode {
    return this.configService.get<Mode>('App.MODE');
  }
  get APP_NAME(): string {
    return this.configService.get<string>('App.APP_NAME');
  }
  get CLIENT_URL(): string {
    return this.configService.get<string>('App.CLIENT_URL');
  }
}
