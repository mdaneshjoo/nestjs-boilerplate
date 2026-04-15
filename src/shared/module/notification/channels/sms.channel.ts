import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { NotificationChannel } from '../notification.enum';
import {
  INotificationChannel,
  NotificationPayload,
  NotificationRecipient,
} from '../interfaces/notification.interface';

@Injectable()
export class SmsChannel implements INotificationChannel {
  readonly channel = NotificationChannel.SMS;
  private readonly logger = new Logger(SmsChannel.name);

  async send(
    recipient: NotificationRecipient,
    payload: NotificationPayload,
  ): Promise<void> {
    if (!recipient.phoneNumber) {
      throw new UnprocessableEntityException(
        'Recipient phoneNumber is required for SMS channel',
      );
    }
    // TODO: integrate an SMS provider (Twilio, Vonage, Kavenegar, ...)
    this.logger.log(
      `[stub] SMS to ${recipient.phoneNumber}: ${payload.body}`,
    );
  }
}
