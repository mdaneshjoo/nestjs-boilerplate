import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Public } from '../../shared/decorator/public-api.decorator';
import { BadRequestDto, UnauthorizedDto } from '../../shared/dto';
import { LoginDto, LoginFailureDto, LoginResponseDto } from './dto';
import { SignUpFailureDto, SignUpResponseDto } from './dto/signup.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

export function LoginDec() {
  return applyDecorators(
    Public(),
    UseGuards(LocalAuthGuard),
    ApiBody({ type: LoginDto }),
    ApiOperation({
      summary: 'Login',
      description: 'login to app',
    }),
    ApiUnauthorizedResponse({
      type: UnauthorizedDto,
      description: 'Unauthorized.',
    }),
    ApiCreatedResponse({
      type: LoginResponseDto,
      description: 'Login succeeded.',
    }),
    ApiBadRequestResponse({
      type: BadRequestDto,
      description: 'Bad request. Body properties are invalid.',
    }),
  );
}

export function SignupDec() {
  return applyDecorators(
    Public(),
    ApiOperation({
      summary: 'Signup',
      description: 'Signup to app',
    }),
    ApiCreatedResponse({
      type: SignUpResponseDto,
      description: 'User created successfully.',
    }),
    ApiBadRequestResponse({
      type: BadRequestDto,
      description: 'Bad request. Body properties are invalid.',
    }),
    ApiUnprocessableEntityResponse({
      type: SignUpFailureDto,
      description: 'Unprocessable request.',
    }),
  );
}
