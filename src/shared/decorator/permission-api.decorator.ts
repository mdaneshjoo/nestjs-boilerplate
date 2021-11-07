import { SetMetadata } from '@nestjs/common';
import { PermissionsEnum } from '../../app/auth/permissions/permissions.enum';

export const Permission_KEY = 'permissions';
export const RequirePermissions = (...permissions: PermissionsEnum[]) =>
  SetMetadata(Permission_KEY, permissions);
