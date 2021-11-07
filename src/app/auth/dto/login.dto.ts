import { PickType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UserDto } from '../../user/dto';
export class LoginDto extends PickType(UserDto, ['workEmail'] as const) {
  /**
   * @example '123456789'
   * */
  @IsNotEmpty()
  password: string;
}
