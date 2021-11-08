export enum CreateUserErrCodeEnum {
  /**
   * message: USER_DUPLICATE
   * **/
  USER_DUPLICATE = 'USER_DUPLICATE',

  /**
   * message: ROLE_NOT_FOUND
   * **/
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
}
export enum CreateUserErrMsgEnum {
  /**
   * message: user already exist
   * **/
  USER_DUPLICATE = 'user already exist',

  /**
   * message: not found any roles to assign! please contact with your admin
   * **/
  ROLE_NOT_FOUND = 'not found any roles to assign! please contact with your admin.',
}
