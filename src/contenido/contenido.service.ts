import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateContenidoDto } from './dto/create-contenido.dto';
import { UpdateContenidoDto } from './dto/update-contenido.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Contenido } from './schema/contenido.schema';
import { Model } from 'mongoose';
import { TemasDto } from './dto/create_tema.dto';

@Injectable()
export class ContenidoService {
  constructor(@InjectModel(Contenido.name) private contenidoModel: Model<Contenido>) {}
  async create(createContenidoDto: CreateContenidoDto): Promise<Contenido> {
    const createdContenido = new this.contenidoModel(createContenidoDto);
    return createdContenido.save();
  }

  async findAll(): Promise<Contenido[]> {
    return this.contenidoModel.find().exec();
  }


  async findOne(id: string) {
    return await this.contenidoModel.findById(id).then((data) => {
      return data
        ? data
        : new NotFoundException(`No se encontro competencia con id:${id}`);
    });
  }

 async update(id :string , updateContenidoDto: UpdateContenidoDto) {
    return await this.contenidoModel
    .findByIdAndUpdate(id, updateContenidoDto)
    .then((data) => {
      return data
        ? data
        : new NotFoundException(
            `No se encontro el contenido con id:${id}`,
          );
    })
    .catch((err) => {
      return new HttpException(err, HttpStatus.CONFLICT);
    });
  }

  async updatetema(id: string, temaDto: TemasDto) {
    const documento = await this.contenidoModel.findById(id).exec();
    if (!documento) {
      return('Documento no encontrado');
    }
    documento.temas.push(temaDto);
    
    return documento.save();
  }

  remove(id: string) {
    return this.contenidoModel.findByIdAndDelete(id).exec();
  }
}
