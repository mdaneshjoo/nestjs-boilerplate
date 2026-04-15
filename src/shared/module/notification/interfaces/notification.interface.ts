import { NotificationChannel } from '../notification.enum';

export interface NotificationRecipient {
  userId?: number;
  email?: string;
  phoneNumber?: string;
  deviceTokens?: string[];
}

export interface NotificationPayload {
  subject?: string;
  body: string;
  html?: string;
  data?: Record<string, unknown>;
}

export interface Notification {
  channels: NotificationChannel[];
  recipient: NotificationRecipient;
  payload: NotificationPayload;
}

export interface ChannelDeliveryResult {
  channel: NotificationChannel;
  success: boolean;
  error?: string;
}

export interface INotificationChannel {
  readonly channel: NotificationChannel;
  send(
    recipient: NotificationRecipient,
    payload: NotificationPayload,
  ): Promise<void>;
}
