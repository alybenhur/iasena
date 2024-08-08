import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({
    default: 'Admin',
    enum: ['Admin', 'Instructor', 'Aprendiz'],
    required: true,
  })
  rol: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
