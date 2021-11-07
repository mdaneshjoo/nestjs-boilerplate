import { registerAs } from '@nestjs/config';
export default registerAs('DB', () => {
  return {
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_PORT: process.env.DB_PORT,
    SYNC: process.env.SYNC,
  };
});
