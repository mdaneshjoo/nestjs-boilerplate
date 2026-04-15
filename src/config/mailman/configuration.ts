import { registerAs } from '@nestjs/config';

export const MAIL_MAN = 'mailman';
export default registerAs(MAIL_MAN, () => {
  return {
    host: process.env.MAIL_HOST,
    port: +process.env.MAIL_PORT,
    username: process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_SENDER_ID,
  };
});
