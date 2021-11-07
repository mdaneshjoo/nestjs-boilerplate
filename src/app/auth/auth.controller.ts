import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
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
  async login(@Req() req: Request, @Body() body: LoginDto) {
    return this.authService.login(req.user);
  }
}
