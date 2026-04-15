import { Injectable, Logger } from '@nestjs/common';
import { EmailChannel } from './channels/email.channel';
import { InAppChannel } from './channels/in-app.channel';
import { PushChannel } from './channels/push.channel';
import { SmsChannel } from './channels/sms.channel';
import {
  ChannelDeliveryResult,
  INotificationChannel,
  Notification,
} from './interfaces/notification.interface';
import { NotificationChannel } from './notification.enum';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly registry: Map<NotificationChannel, INotificationChannel>;

  constructor(
    email: EmailChannel,
    sms: SmsChannel,
    push: PushChannel,
    inApp: InAppChannel,
  ) {
    this.registry = new Map<NotificationChannel, INotificationChannel>([
      [email.channel, email],
      [sms.channel, sms],
      [push.channel, push],
      [inApp.channel, inApp],
    ]);
  }

  async send(notification: Notification): Promise<ChannelDeliveryResult[]> {
    const results = await Promise.all(
      notification.channels.map((channel) =>
        this.dispatch(channel, notification),
      ),
    );
    return results;
  }

  private async dispatch(
    channel: NotificationChannel,
    notification: Notification,
  ): Promise<ChannelDeliveryResult> {
    const handler = this.registry.get(channel);
    if (!handler) {
      const error = `No handler registered for channel "${channel}"`;
      this.logger.warn(error);
      return { channel, success: false, error };
    }
    try {
      await handler.send(notification.recipient, notification.payload);
      return { channel, success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Channel "${channel}" failed: ${message}`);
      return { channel, success: false, error: message };
    }
  }
}
