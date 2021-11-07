import { RoleInterface } from '../../roles/interfaces/role.interface';

export interface PayloadInterface {
  id: number;
  sub: { role: RoleInterface[] };
  iat: number;
  exp: number;
}
