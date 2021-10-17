import { Module } from '@nestjs/common';
import { CreditService } from './credit.service';

@Module({
  providers: [CreditService]
})
export class CreditModule {}
