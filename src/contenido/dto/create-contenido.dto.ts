import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TemasDto } from './create_tema.dto';

export class CreateContenidoDto {
  @IsNotEmpty()
  @IsString()
  competencia: string;

  @IsArray()
  @IsOptional()
  temas: TemasDto[];
}
