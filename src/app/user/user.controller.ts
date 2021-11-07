import { Body, Controller, Post } from '@nestjs/common';
import { RequirePermissions } from '../../shared/decorator/permission-api.decorator';
import { PermissionsEnum } from '../auth/permissions/permissions.enum';
import { CreateUserDto } from './dto';
import { CreateUserDec } from './user.decorator';

@Controller('v1/user')
export class UserController {
  @Post('')
  @CreateUserDec()
  @RequirePermissions(PermissionsEnum.CREATE_USER)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createUser(@Body() body: CreateUserDto) {
    return 'not complete yet';
  }
}
