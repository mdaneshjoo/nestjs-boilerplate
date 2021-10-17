import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProfileDocument = Profile & Document;
export class Profile {
  @Prop()
  personalEmail: string;

  @Prop()
  dob: Date;

  @Prop()
  birthCertificationNumber: number;

  @Prop()
  nationalIdNumber: number;

  @Prop()
  // Place of birth
  pob: string;

  @Prop()
  emergencyPhone: number;

  @Prop()
  martialSituation: string;

  @Prop()
  spouseName: string;

  @Prop()
  childrenNumber: number;

  @Prop()
  militaryServiceStatus: string;

  @Prop()
  bloodType: string;

  @Prop()
  mailingAddress: string;

  @Prop()
  postalCode: number;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
