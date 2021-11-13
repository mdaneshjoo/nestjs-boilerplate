import { EyeModule, WebHookProviderEnum } from '@emdjoo/eye';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './app/auth/auth.module';
import { JwtAuthGuard } from './app/auth/guards/jwt-auth.guard';
import { ProfileModule } from './app/profile/profile.module';
import { RolesModule } from './app/roles/roles.module';
import { UserModule } from './app/user/user.module';
import { PrivilegesModule } from './commands/privileges.module';
import { AppConfigModule } from './config/app/config/config.module';
import { DataBaseConfigModule } from './config/database/config.module';
import { DataBaseConfigService } from './config/database/config.service';
import { MailmanConfigModule } from './config/mailman/config.module';
import { CustomLoggerModule } from './shared/module/logger/logger.module';
import { MailModule } from './shared/module/mail/mail.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    HttpModule,
    EyeModule.forRoot({
      url: 'https://discord.com/api/webhooks/907688163760287754/3hl4vsEuvZnb84xqXnIsqb_apQRInHUQqKDw4Sn8h0ywgqOC7TwKXxG9z8a4_ksNr5mJ',
      webHookProvider: WebHookProviderEnum.discord,
    }),
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
        charset: 'utf8mb4_unicode_ci',
        migrations: ['dist/db/migrations/*{.ts,.js}'],
        migrationsTableName: 'migrations',
        migrationsRun: false,
        multipleStatements: true,
        cli: {
          migrationsDir: 'src/db/migrations',
        },
      }),
      inject: [DataBaseConfigService],
    }),
    ScheduleModule.forRoot(),
    ProfileModule,
    AppConfigModule,
    CustomLoggerModule,
    PrivilegesModule,
    RolesModule,
    MailmanConfigModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
