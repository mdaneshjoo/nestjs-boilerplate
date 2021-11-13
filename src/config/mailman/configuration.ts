import { registerAs } from '@nestjs/config';
import { MailmanOptions } from '@squareboat/nest-mailman';
import * as path from 'path';

export const MAIL_MAN = 'mailman';
export default registerAs(MAIL_MAN, () => {
  return {
    host: process.env.MAIL_HOST,
    port: +process.env.MAIL_PORT,
    username: process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_SENDER_ID,
    path: path.join(__dirname, '../../shared/module/mail/templates'),
  } as MailmanOptions;
});
