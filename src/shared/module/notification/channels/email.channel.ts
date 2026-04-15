import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { NotificationChannel } from '../notification.enum';
import {
  INotificationChannel,
  NotificationPayload,
  NotificationRecipient,
} from '../interfaces/notification.interface';

@Injectable()
export class EmailChannel implements INotificationChannel {
  readonly channel = NotificationChannel.EMAIL;

  constructor(private readonly mailer: MailerService) {}

  async send(
    recipient: NotificationRecipient,
    payload: NotificationPayload,
  ): Promise<void> {
    if (!recipient.email) {
      throw new UnprocessableEntityException(
        'Recipient email is required for email channel',
      );
    }
    await this.mailer.sendMail({
      to: recipient.email,
      subject: payload.subject ?? '',
      text: payload.html ? undefined : payload.body,
      html: payload.html ?? undefined,
    });
  }
}
