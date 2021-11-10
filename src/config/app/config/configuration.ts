import { registerAs } from '@nestjs/config';

export default registerAs('App', () => {
  return {
    PORT: process.env.PORT,
    MODE: process.env.MODE,
    APP_NAME: process.env.APP_NAME,
    CLIENT_URL: process.env.CLIENT_URL,
  };
});
