import { PermissionsEnum } from '../auth/permissions/permissions.enum';
import { Roles } from '../roles/entities/roles.entity';

export enum CreateUserErrEnum {
  /**
   * message: USER_DUPLICATE
   * **/
  USER_DUPLICATE_CODE = 'USER_DUPLICATE',

  /**
   * message: user already exist
   * **/
  USER_DUPLICATE_MSG = 'user already exist',
}

export const ConstRoles: { [key: string]: Roles } = {
  Admin: {
    roleName: 'admin',
    description: 'this is admin role',
    createdBy: 0,
  },
};
