import { IsOptional, IsString } from 'class-validator';

export class PermissionsDto {
  @IsOptional()
  @IsString()
  permissionsName?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
