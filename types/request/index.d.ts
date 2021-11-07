declare global {
  module 'express' {
    import { User } from '../../src/app/user/entities/user.entity';

    export interface Request {
      user: User;
    }
  }
}
