import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;
export class User {
  @Prop()
  name: string;

  @Prop()
  lastName: string;

  @Prop()
  nickName: string;

  @Prop()
  workEmail: string;

  @Prop()
  password: string;

  @Prop()
  phoneNumber: number;

  @Prop()
  joinDate: Date;

  @Prop()
  stacks: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    const hashed = await bcrypt.hash(this.get('password'), 10);
    this.set('password', hashed);
    return next();
  } catch (e) {
    console.log(e);
    return next(e);
  }
});
