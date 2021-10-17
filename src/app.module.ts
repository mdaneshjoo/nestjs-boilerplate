import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './app/auth/auth.module';
import { JwtAuthGuard } from './app/auth/passport/jwt-auth.guard';
import { CreditModule } from './app/credit/credit.module';
import { ProfileModule } from './app/profile/profile.module';
import { StacksModule } from './app/stacks/stacks.module';
import { UserModule } from './app/user/user.module';
import { AppConfigModule } from './config/app/config/config.module';
import { AppConfigService } from './config/app/config/config.service';
import { CustomLoggerModule } from './shared/module/logger/logger.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    MongooseModule.forRoot('mongodb://localhost/webcentriq', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    StacksModule,
    ProfileModule,
    CreditModule,
    AppConfigModule,
    CustomLoggerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppConfigService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
