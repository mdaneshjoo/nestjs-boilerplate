import { registerAs } from '@nestjs/config';

export default registerAs('App', () => {
  return {
    PORT: process.env.PORT,
    MODE: process.env.MODE,
  };
});
