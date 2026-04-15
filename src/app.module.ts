import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './app/auth/auth.module';
import { JwtAuthGuard } from './app/auth/guards/jwt-auth.guard';
import { ProfileModule } from './app/profile/profile.module';
import { RolesModule } from './app/roles/roles.module';
import { UserModule } from './app/user/user.module';
import { AppConfigModule } from './config/app/config/config.module';
import { DataBaseConfigModule } from './config/database/config.module';
import { DataBaseConfigService } from './config/database/config.service';
import { MailmanConfigModule } from './config/mailman/config.module';
import { AllExceptionFilter } from './shared/module/error/all-exception-filter';
import { CustomLoggerModule } from './shared/module/logger/logger.module';
import { NotificationModule } from './shared/module/notification/notification.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    AuthModule,
    UserModule,
    HttpModule,
    TypeOrmModule.forRootAsync({
      imports: [DataBaseConfigModule],
      useFactory: (dbConfigService: DataBaseConfigService) => ({
        type: 'postgres',
        host: dbConfigService.DB_HOST,
        port: dbConfigService.DB_PORT,
        username: dbConfigService.DB_USERNAME,
        password: dbConfigService.DB_PASSWORD,
        database: dbConfigService.DB_NAME,
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: dbConfigService.SYNC,
        migrations: ['dist/db/migrations/*{.ts,.js}'],
        migrationsTableName: 'migrations',
        migrationsRun: false,
      }),
      inject: [DataBaseConfigService],
    }),
    ScheduleModule.forRoot(),
    ProfileModule,
    AppConfigModule,
    CustomLoggerModule,
    RolesModule,
    MailmanConfigModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
    { provide: APP_FILTER, useClass: AllExceptionFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
