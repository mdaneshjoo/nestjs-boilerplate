import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { EmailChannel } from './channels/email.channel';
import { InAppChannel } from './channels/in-app.channel';
import { PushChannel } from './channels/push.channel';
import { SmsChannel } from './channels/sms.channel';
import { NotificationService } from './notification.service';

@Module({
  imports: [MailModule],
  providers: [
    EmailChannel,
    SmsChannel,
    PushChannel,
    InAppChannel,
    NotificationService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
