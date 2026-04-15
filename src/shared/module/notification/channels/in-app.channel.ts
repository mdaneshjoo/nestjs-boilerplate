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
export class InAppChannel implements INotificationChannel {
  readonly channel = NotificationChannel.IN_APP;
  private readonly logger = new Logger(InAppChannel.name);

  async send(
    recipient: NotificationRecipient,
    payload: NotificationPayload,
  ): Promise<void> {
    if (!recipient.userId) {
      throw new UnprocessableEntityException(
        'Recipient userId is required for in-app channel',
      );
    }
    // TODO: persist to an `in_app_notifications` table and/or push over WebSocket.
    this.logger.log(
      `[stub] In-app notification for user ${recipient.userId}: ${payload.subject ?? payload.body}`,
    );
  }
}
