import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '../../config/app/config/config.module';
import { MailModule } from '../../shared/module/mail/mail.module';
import { RolesModule } from '../roles/roles.module';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AppConfigModule,
    RolesModule,
    MailModule,
  ],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
  controllers: [UserController],
})
export class UserModule {}
