import { IsOptional, IsString } from 'class-validator';

export class RoleDto {
  @IsOptional()
  @IsString()
  roleName?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
