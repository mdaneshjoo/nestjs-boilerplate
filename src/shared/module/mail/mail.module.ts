import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailmanModule } from '@squareboat/nest-mailman';
import { AppConfigModule } from '../../../config/app/config/config.module';
import { MAIL_MAN } from '../../../config/mailman/configuration';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailmanModule.registerAsync({
      imports: [ConfigService],
      useFactory: (config: ConfigService) => config.get(MAIL_MAN),
      inject: [ConfigService],
    }),
    AppConfigModule,
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
