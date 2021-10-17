import { Module } from '@nestjs/common';
import { StacksService } from './stacks.service';

@Module({
  providers: [StacksService]
})
export class StacksModule {}
