import { IsEmail, IsOptional } from 'class-validator';

export class UserDto {
  joinDate: Date;
  lastName: string;
  name: string;
  nickName: string;
  password: string;
  phoneNumber: number;
  @IsOptional()
  stacks: string;

  /**
   * @example 'me@domain.com'
   * **/
  @IsEmail()
  workEmail: string;
}
