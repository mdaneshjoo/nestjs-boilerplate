import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Public } from '../../shared/decorator/public-api.decorator';
import { BadRequestDto, UnauthorizedDto } from '../../shared/dto';
import {
  ForgetPassConfirmFailureDto,
  ForgetPassConfirmResponseDto,
  LoginDto,
  LoginResponseDto,
} from './dto';
import {
  ForgetPassFailureDto,
  ForgetPassResponseDto,
} from './dto/forget-pass.dto';
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
export function ForgetPassDec() {
  return applyDecorators(
    Public(),
    ApiOperation({
      summary: 'Forget password',
      description: 'The forget password code valid for 60 second',
    }),
    ApiOkResponse({
      type: ForgetPassResponseDto,
      description: 'send a code to email',
    }),
    ApiBadRequestResponse({
      type: BadRequestDto,
      description: 'Bad request. Body properties are invalid.',
    }),
    ApiUnauthorizedResponse({
      type: UnauthorizedDto,
      description: 'Unauthorized.',
    }),
    ApiUnprocessableEntityResponse({
      type: ForgetPassFailureDto,
      description: 'Unprocessable request.',
    }),
  );
}

export function ForgetPassConfirmDec() {
  return applyDecorators(
    Public(),
    ApiOperation({
      summary: 'Forget password Confirm',
      description: '',
    }),
    ApiOkResponse({
      type: ForgetPassConfirmResponseDto,
      description: 'password successfully changed',
    }),
    ApiBadRequestResponse({
      type: BadRequestDto,
      description: 'Bad request. Body properties are invalid.',
    }),
    ApiUnauthorizedResponse({
      type: UnauthorizedDto,
      description: 'Unauthorized.',
    }),
    ApiUnprocessableEntityResponse({
      type: ForgetPassConfirmFailureDto,
      description: 'Unprocessable request.',
    }),
  );
}
