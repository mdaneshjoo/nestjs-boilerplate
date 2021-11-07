import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../../profile/entities/profile.entity';
import { CreditService } from './credit.service';
import { Credit } from './entities/credit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Credit])],
  providers: [CreditService],
})
export class CreditModule {}
