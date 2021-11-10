import {
  Body,
  Controller,
  Post,
  Put,
  Req,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../../shared/decorator/public-api.decorator';
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
  LoginDto,
  LoginResponseDto,
} from './dto';
import { ForgetPassDto, ForgetPassResponseDto } from './dto/forget-pass.dto';
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
    await this.authService.signUp(body);
    return {
      successCode: SignupSuccessCodeEnum.CODE,
      message: SignupSuccessMsgEnum.MESSAGE,
    };
  }

  @Post('signup/confirm')
  async confirmSignup() {}

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

  @Put('change-password')
  async changePass() {}

  @Put('change-phone-number')
  async changePhoneNumber() {}

  @Put('change-email')
  @Public()
  async changeEmail() {
    throw new UnprocessableEntityException('asdadasda');
  }
}
