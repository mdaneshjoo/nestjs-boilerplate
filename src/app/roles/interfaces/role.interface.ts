import { CommonEntity } from '../../../shared/entities/common.entity';
import { RoleDto } from '../dto';
import { PermissionsInterface } from './permissions.interface';

export type RoleInterface = RoleI & RoleDto & CommonEntity;

interface RoleI {
  permissions: PermissionsInterface[];
}
