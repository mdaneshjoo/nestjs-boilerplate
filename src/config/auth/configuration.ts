import { registerAs } from '@nestjs/config';

export default registerAs('Auth', () => {
  return {
    EXPIRE: process.env.EXPIRE,
    SECRET: process.env.SECRET,
  };
});
