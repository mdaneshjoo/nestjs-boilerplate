import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  ForgetPassConfirmDec,
  ForgetPassDec,
  LoginDec,
  SignupDec,
} from './auth.decorator';
import {
  ForgetPassConfirmSuccessCodeEnum,
  ForgetPassConfirmSuccessMsgEnum,
  ForgetPassSuccessCodeEnum,
  ForgetPassSuccessMsgEnum,
  SignupSuccessCodeEnum,
  SignupSuccessMsgEnum,
} from './auth.enum';
import { AuthService } from './auth.service';
import {
  ForgetPassConfirmDto,
  ForgetPassConfirmResponseDto,
  ForgetPassDto,
  ForgetPassResponseDto,
  LoginDto,
  LoginResponseDto,
  SignupDto,
  SignUpResponseDto,
} from './dto';

@ApiTags('auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @LoginDec()
  async login(
    @Req() req: Request,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    await this.authService.signUp(body);
    return {
      successCode: SignupSuccessCodeEnum.CODE,
      message: SignupSuccessMsgEnum.MESSAGE,
    };
  }

  @Post('signup/confirm')
  async confirmSignup() {}

  @Post('signup/resend-confirm')
  async confirmSignupResend() {}

  @Post('forget-password')
  @ForgetPassDec()
  async forgetPass(
    @Body() bodyDto: ForgetPassDto,
  ): Promise<ForgetPassResponseDto> {
    await this.authService.forgetPass(bodyDto.email);
    return {
      successCode: ForgetPassSuccessCodeEnum.CODE,
      message: ForgetPassSuccessMsgEnum.MESSAGE,
    };
  }

  @Post('forget-pass/confirm')
  @ForgetPassConfirmDec()
  async forgetPassConfirm(
    @Body() body: ForgetPassConfirmDto,
  ): Promise<ForgetPassConfirmResponseDto> {
    await this.authService.forgetPassConfirm(body);
    return {
      successCode: ForgetPassConfirmSuccessCodeEnum.CODE,
      message: ForgetPassConfirmSuccessMsgEnum.MESSAGE,
    };
  }
}
