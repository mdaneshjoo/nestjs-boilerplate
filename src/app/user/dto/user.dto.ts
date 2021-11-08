import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IdDto } from '../../../shared/dto/id.dto';

export class UserDto {
  @IsOptional()
  joinDate?: Date;

  /**
   * @example 'Due'
   * */
  @IsOptional()
  @IsString()
  @MinLength(3)
  lastName?: string;

  /**
   * @example 'Jon'
   * */
  @IsOptional()
  @IsString()
  @MinLength(3)
  firstName?: string;

  @IsOptional()
  @IsString()
  nickName?: string;

  /**
   * @example '+16505130514'
   * */
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  /**
   * @example 'me@domain.com'
   * **/
  @IsNotEmpty()
  @IsEmail()
  workEmail: string;

  @ValidateNested()
  @Type(() => IdDto)
  rolesId?: IdDto[];
}
