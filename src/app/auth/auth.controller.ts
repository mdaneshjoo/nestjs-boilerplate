import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginDec } from './auth.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';

@ApiTags('auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @LoginDec()
  async login(@Request() req, @Body() body: LoginDto) {
    return this.authService.login(req.user);
  }
}
