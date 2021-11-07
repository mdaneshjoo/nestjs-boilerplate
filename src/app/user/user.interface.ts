import { CommonEntity } from '../../shared/entities/common.entity';
import { UserDto } from './dto';

export type UserInterface = UserDto & UserI & CommonEntity;

interface UserI {
  password?: string;
}
