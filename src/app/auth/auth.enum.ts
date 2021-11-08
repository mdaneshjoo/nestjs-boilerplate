import { CreateUserErrCodeEnum, CreateUserErrMsgEnum } from '../user/user.enum';

export enum LoginErrorCodeEnum {}
export enum LoginErrorMsgEnum {}

export enum SignupErrorCodeEnum {
  USER_DUPLICATE = CreateUserErrCodeEnum.USER_DUPLICATE,
  ROLE_NOT_FOUND = CreateUserErrCodeEnum.ROLE_NOT_FOUND,
}
export enum SignupErrorMsgEnum {
  USER_DUPLICATE = CreateUserErrMsgEnum.USER_DUPLICATE,
  ROLE_NOT_FOUND = CreateUserErrMsgEnum.ROLE_NOT_FOUND,
}
