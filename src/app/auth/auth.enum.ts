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

export enum SignupSuccessMsgEnum {
  MESSAGE = 'Send a confirmation link to your email please check your inbox. you have only 15 minute to use it',
}
export enum SignupSuccessCodeEnum {
  CODE = 'SIGNUP_SUCCESS',
}

export enum ForgetPassErrorCodeEnum {
  EMAIL_NOT_FOUND = 'EMAIL_NOT_FOUND',
}

export enum ForgetPassErrorMsgEnum {
  EMAIL_NOT_FOUND = 'Email is not found or not confirmed yet.',
}

export enum ForgetPassSuccessMsgEnum {
  MESSAGE = 'Send a verification code to your email please check your inbox',
}
export enum ForgetPassSuccessCodeEnum {
  CODE = 'FORGET_PASS_SUCCESS',
}

export enum ForgetPassConfirmErrorCodeEnum {
  INVALID_CONFIRM_CODE = 'INVALID_CONFIRM_CODE',
}
export enum ForgetPassConfirmErrorMsgEnum {
  INVALID_CONFIRM_CODE = `user doesn't exist or your confirmation code has expired`,
}
export enum ForgetPassConfirmSuccessMsgEnum {
  MESSAGE = 'password successfully changed!',
}
export enum ForgetPassConfirmSuccessCodeEnum {
  CODE = 'FORGET_PASS_CONFIRMED',
}

export enum SignupConfirmErrorCodeEnum {}
export enum SignupConfirmErrorMsgEnum {}
export enum SignupConfirmSuccessMsgEnum {
  MESSAGE = 'password successfully changed!',
}
export enum SignupConfirmSuccessCodeEnum {
  CODE = 'FORGET_PASS_CONFIRMED',
}
