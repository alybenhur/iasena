import { IsString } from 'class-validator';

export class AgregarTemaDtos {
  @IsString()
  readonly tema: string;
}
