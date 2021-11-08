import { SetMetadata } from '@nestjs/common';
import { PermissionsEnum } from '../../app/roles/permissions.enum';

export const Permission_KEY = 'permissions';

export const RequirePermissions = (...permissions: PermissionsEnum[]) =>
  SetMetadata(Permission_KEY, permissions);
