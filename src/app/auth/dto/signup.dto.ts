import { PickType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { FailureDtoInterface } from '../../../shared/interfaces/failure-dto.interface';
import { ResponseDtoInterface } from '../../../shared/interfaces/response-dto.interface';
import { UserDto } from '../../user/dto';
import {
  SignupErrorCodeEnum,
  SignupErrorMsgEnum,
  SignupSuccessCodeEnum,
  SignupSuccessMsgEnum,
} from '../auth.enum';

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

export class SignUpResponseDto implements ResponseDtoInterface {
  successCode: SignupSuccessCodeEnum;
  message: SignupSuccessMsgEnum;
}

export class SignUpFailureDto implements FailureDtoInterface {
  errorCode: SignupErrorCodeEnum;
  message: SignupErrorMsgEnum;
}
