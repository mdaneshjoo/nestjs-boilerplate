import { PickType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { FailureDtoInterface } from '../../../shared/interfaces/failure-dto.interface';
import { UserDto } from '../../user/dto';
import { LoginErrorCodeEnum, LoginErrorMsgEnum } from '../auth.enum';

export class LoginDto extends PickType(UserDto, ['workEmail'] as const) {
  /**
   * @example '123456789'
   * */
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto {
  /**
   * access_token should be stored in local storage of app.
   * @example 'eyJhbGciO.123'
   */
  access_token: string;
}

export class LoginFailureDto implements FailureDtoInterface {
  /**
   * A short code for the error that happended.
   */
  errorCode: LoginErrorCodeEnum;

  /**
   * Description for error code.
   */
  message: LoginErrorMsgEnum;
}
