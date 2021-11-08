import { PickType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { FailureDtoInterface } from '../../../shared/interfaces/failure-dto.interface';
import { UserDto } from '../../user/dto';
import { SignupErrorCodeEnum, SignupErrorMsgEnum } from '../auth.enum';
import { LoginResponseDto } from './login.dto';

export class SignupDto extends PickType(UserDto, [
  'workEmail',
  'lastName',
] as const) {
  /**
   * @example '123456789'
   * */
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  /**
   * @example '+16505130514'
   * */
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  /**
   * @example 'Jon'
   * */
  @IsString()
  @MinLength(3)
  firstName: string;
}

export class SignUpResponseDto extends LoginResponseDto {}

export class SignUpFailureDto implements FailureDtoInterface {
  errorCode: SignupErrorCodeEnum;
  message: SignupErrorMsgEnum;
}
