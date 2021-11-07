import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DataBaseConfigService {
  constructor(private configService: ConfigService) {}
  get DB_HOST(): string {
    return this.configService.get<string>('DB.DB_HOST');
  }
  get DB_NAME(): string {
    return this.configService.get<string>('DB.DB_NAME');
  }
  get DB_USERNAME(): string {
    return this.configService.get<string>('DB.DB_USERNAME');
  }
  get DB_PASSWORD(): string {
    return this.configService.get<string>('DB.DB_PASSWORD');
  }
  get DB_PORT(): number {
    return +this.configService.get<string>('DB.DB_PORT');
  }
  get SYNC(): boolean {
    return this.configService.get<string>('DB.SYNC') === 'true';
  }
}
