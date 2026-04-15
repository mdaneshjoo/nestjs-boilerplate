import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MAIL_MAN } from '../../../config/mailman/configuration';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const opts = config.get<{
          host: string;
          port: number;
          username: string;
          password: string;
          from: string;
        }>(MAIL_MAN);
        return {
          transport: {
            host: opts.host,
            port: opts.port,
            secure: opts.port === 465,
            auth: {
              user: opts.username,
              pass: opts.password,
            },
          },
          defaults: {
            from: opts.from,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [MailerModule],
})
export class MailModule {}
