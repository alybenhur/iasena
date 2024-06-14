import { PartialType } from '@nestjs/mapped-types';
import { CreateContenidoDto } from './create-contenido.dto';
import { IsMongoId, IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdateContenidoDto extends PartialType(CreateContenidoDto) {

   /* @IsNotEmpty()
  @IsString()
  @Matches(/^(?!\s*$).+/, {
    message: 'El campo id es obligatorio',
  })
  @IsMongoId()
  readonly id: string;
*/
}
