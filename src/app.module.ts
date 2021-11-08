import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './app/auth/auth.module';
import { JwtAuthGuard } from './app/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './app/auth/guards/permission.guard';
import { CreditModule } from './app/employee/credit/credit.module';
import { StacksModule } from './app/employee/stacks/stacks.module';
import { ProfileModule } from './app/profile/profile.module';
import { RolesModule } from './app/roles/roles.module';
import { UserModule } from './app/user/user.module';
import { PrivilegesModule } from './commands/privileges.module';
import { AppConfigModule } from './config/app/config/config.module';
import { DataBaseConfigModule } from './config/database/config.module';
import { DataBaseConfigService } from './config/database/config.service';
import { CustomLoggerModule } from './shared/module/logger/logger.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
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
    StacksModule,
    ProfileModule,
    CreditModule,
    AppConfigModule,
    CustomLoggerModule,
    PrivilegesModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
