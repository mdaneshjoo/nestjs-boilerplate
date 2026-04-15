import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { NotificationChannel } from '../notification.enum';
import {
  INotificationChannel,
  NotificationPayload,
  NotificationRecipient,
} from '../interfaces/notification.interface';

@Injectable()
export class PushChannel implements INotificationChannel {
  readonly channel = NotificationChannel.PUSH;
  private readonly logger = new Logger(PushChannel.name);

  async send(
    recipient: NotificationRecipient,
    payload: NotificationPayload,
  ): Promise<void> {
    if (!recipient.deviceTokens?.length) {
      throw new UnprocessableEntityException(
        'Recipient deviceTokens are required for push channel',
      );
    }
    // TODO: integrate FCM (firebase-admin), APNs, or web-push
    this.logger.log(
      `[stub] Push to ${recipient.deviceTokens.length} device(s): ${payload.subject ?? payload.body}`,
    );
  }
}
