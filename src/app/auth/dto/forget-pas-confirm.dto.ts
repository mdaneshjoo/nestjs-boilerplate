import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { FailureDtoInterface } from '../../../shared/interfaces/failure-dto.interface';
import { ResponseDtoInterface } from '../../../shared/interfaces/response-dto.interface';
import {
  ForgetPassConfirmErrorCodeEnum,
  ForgetPassConfirmErrorMsgEnum,
  ForgetPassConfirmSuccessCodeEnum,
  ForgetPassConfirmSuccessMsgEnum,
} from '../auth.enum';

export class ForgetPassConfirmFailureDto implements FailureDtoInterface {
  errorCode: ForgetPassConfirmErrorCodeEnum;
  message: ForgetPassConfirmErrorMsgEnum;
}

export class ForgetPassConfirmResponseDto implements ResponseDtoInterface {
  successCode: ForgetPassConfirmSuccessCodeEnum;
  message: ForgetPassConfirmSuccessMsgEnum;
}

export class ForgetPassConfirmDto {
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
