import { Module } from '@nestjs/common';
import { ContenidoService } from './contenido.service';
import { ContenidoController } from './contenido.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Contenido, ContenidoSchema } from './schema/contenido.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contenido.name, schema: ContenidoSchema },
    ]),
  ],
  controllers: [ContenidoController],
  providers: [ContenidoService],
})
export class ContenidoModule {}
