import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { CreateUserDto } from './dto';

export function CreateUserDec() {
  return applyDecorators(
    ApiBody({ type: CreateUserDto }),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'create a user',
      description: '',
    }),
  );
}
