import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../shared/decorator/public-api.decorator';
import { LoginDto } from './dto';
import { LocalAuthGuard } from './passport/local-auth.guard';

export function LoginDec() {
  return applyDecorators(
    Public(),
    UseGuards(LocalAuthGuard),
    ApiBody({ type: LoginDto }),
    ApiOperation({
      summary: 'Login',
      description: '',
    }),
  );
}
