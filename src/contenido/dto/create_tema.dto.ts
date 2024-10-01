import { IsNotEmpty, IsString } from 'class-validator';

export class TemasDto {
  @IsString()
  @IsNotEmpty()
  tema: string;
}
