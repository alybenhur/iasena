import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ContenidoService } from './contenido.service';
import { CreateContenidoDto } from './dto/create-contenido.dto';
import { UpdateContenidoDto } from './dto/update-contenido.dto';
import { TemasDto } from './dto/create_tema.dto';
import { AgregarTemaDtos } from './dto/agregarTema.dto';

@Controller('contenido')
export class ContenidoController {
  constructor(private readonly contenidoService: ContenidoService) {}

  @Post()
  create(@Body() createContenidoDto: CreateContenidoDto) {
    return this.contenidoService.create(createContenidoDto);
  }

  @Get()
  findAll() {
    return this.contenidoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contenidoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContenidoDto: UpdateContenidoDto,
  ) {
    return this.contenidoService.update(id, updateContenidoDto);
  }

  @Put('tema/:id')
  updatetema(@Param('id') id: string, @Body() temasDto: TemasDto) {
    return this.contenidoService.updatetema(id, temasDto);
  }

  @Put('/agregarTema/:id')
  agregarTema(
    @Param('id') id: string,
    @Body() agregarTemaDto: AgregarTemaDtos,
  ) {
    return this.contenidoService.agregarTema(id, agregarTemaDto);
  }

  @Delete('eliminar/:id')
  remove(@Param('id') id: string) {
    return this.contenidoService.remove(id);
  }

  @Delete('/competencias')
  deleteCompetencias(@Body() ids: string[]) {
    return this.contenidoService.deleteCompetencias(ids);
  }

  @Delete('tema/:id/:posicion')
  deleteTema(@Param('id') id: string, @Param('posicion') posicion: string) {
    return this.contenidoService.deleteTema(id, +posicion);
  }
}
