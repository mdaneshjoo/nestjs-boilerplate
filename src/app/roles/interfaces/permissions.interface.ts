import { CommonEntity } from '../../../shared/entities/common.entity';
import { PermissionsDto } from '../dto';

export type PermissionsInterface = PermissionsDto & CommonEntity & PermissionsI;

interface PermissionsI {}
