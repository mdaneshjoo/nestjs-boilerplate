import { RoleInterface } from '../../roles/interfaces/role.interface';
import { ForgetPassConfirmDto } from '../dto';
import { SignupDto } from '../dto/signup.dto';

export interface PayloadInterface {
  id: number;
  sub: { role: RoleInterface[] };
  iat: number;
  exp: number;
}
export type SignUpBodyInterface = SignupDto;

export type ForgetPassConfirmBodyInterface = ForgetPassConfirmDto;
