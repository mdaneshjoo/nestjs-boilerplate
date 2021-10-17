import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CreditDocument = Credit & Document;
export class Credit {
  @Prop()
  creditId: number;

  @Prop()
  isCreditEditable: boolean;

  @Prop()
  shaba: number;
}
export const CreditSchema = SchemaFactory.createForClass(Credit);
