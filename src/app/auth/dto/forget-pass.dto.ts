import { IsEmail, IsNotEmpty } from 'class-validator';
import { FailureDtoInterface } from '../../../shared/interfaces/failure-dto.interface';
import { ResponseDtoInterface } from '../../../shared/interfaces/response-dto.interface';
import {
  ForgetPassErrorCodeEnum,
  ForgetPassErrorMsgEnum,
  ForgetPassSuccessCodeEnum,
  ForgetPassSuccessMsgEnum,
} from '../auth.enum';

export class ForgetPassFailureDto implements FailureDtoInterface {
  errorCode: ForgetPassErrorCodeEnum;
  message: ForgetPassErrorMsgEnum;
}

export class ForgetPassResponseDto implements ResponseDtoInterface {
  successCode: ForgetPassSuccessCodeEnum;
  message: ForgetPassSuccessMsgEnum;
}

export class ForgetPassDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
