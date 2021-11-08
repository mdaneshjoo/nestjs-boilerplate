import { Body, Controller, Post, Put, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { LoginDec, SignupDec } from './auth.decorator';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto';
import { SignupDto, SignUpResponseDto } from './dto/signup.dto';

@ApiTags('auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @LoginDec()
  async login(
    @Req() req: Request,
    @Body() body: LoginDto,
  ): Promise<LoginResponseDto> {
    const payload = this.authService.login(req.user);
    return {
      access_token: payload,
    };
  }

  @Post('signup')
  @SignupDec()
  async signUp(@Body() body: SignupDto): Promise<SignUpResponseDto> {
    const payload = await this.authService.signUp(body);
    return { access_token: payload };
  }

  @Post('forget-password')
  async forgetPass() {}

  @Put('change-password')
  async changePass() {}

  @Put('change-phone-number')
  async changePhoneNumber() {}

  @Put('change-email')
  async changeEmail() {}
}
