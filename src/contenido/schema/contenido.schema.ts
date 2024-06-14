import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { TemasDto } from '../dto/create_tema.dto';

export type ContenidoDocument = HydratedDocument<Contenido>;

@Schema()
export class Contenido {
  @Prop({ required: true })
  competencia: string;

  @Prop()
   temas: TemasDto[];

  }
  
export const ContenidoSchema = SchemaFactory.createForClass(Contenido);
