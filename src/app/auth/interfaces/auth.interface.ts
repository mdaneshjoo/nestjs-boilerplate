import { RoleInterface } from '../../roles/interfaces/role.interface';
import { SignupDto } from '../dto/signup.dto';

export interface PayloadInterface {
  id: number;
  sub: { role: RoleInterface[] };
  iat: number;
  exp: number;
}
export type SignUpBodyInterface = SignUpBodyI & SignupDto;
interface SignUpBodyI {}
