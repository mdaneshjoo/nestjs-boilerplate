import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppConfigModule } from '../../config/app/config/config.module';
import { AppConfigService } from '../../config/app/config/config.service';
import { AuthConfigModule } from '../../config/auth/config.module';
import { AuthConfigService } from '../../config/auth/config.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './passport/jwt.strategy';
import { LocalStrategy } from './passport/local.strategy';
import { PermissionsGuard } from './guards/permission.guard';

@Global()
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [AuthConfigModule, AppConfigModule],
      useFactory: async (
        authConfigService: AuthConfigService,
        appConfigService: AppConfigService,
      ) => ({
        secret: authConfigService.SECRET,
        signOptions: {
          expiresIn:
            appConfigService.MODE === 'PROD' ? authConfigService.EXPIRE : '1y',
        },
      }),
      inject: [AuthConfigService, AppConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, AuthConfigService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
