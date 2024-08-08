import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ContenidoService } from './contenido.service';
import { CreateContenidoDto } from './dto/create-contenido.dto';
import { UpdateContenidoDto } from './dto/update-contenido.dto';
import { TemasDto } from './dto/create_tema.dto';
import { AgregarTemaDtos } from './dto/agregarTema.dto';
import { AdminInstructorAuthGuard } from 'src/guard/admin-instructor.guard';
import { AdminAuthGuard } from 'src/guard/admin.guard';

@Controller('contenido')
export class ContenidoController {
  constructor(private readonly contenidoService: ContenidoService) {}

  @UseGuards(AdminAuthGuard)
  @Post()
  create(@Body() createContenidoDto: CreateContenidoDto) {
    return this.contenidoService.create(createContenidoDto);
  }

  @UseGuards(AdminInstructorAuthGuard)
  @Get()
  findAll() {
    return this.contenidoService.findAll();
  }

  @UseGuards(AdminInstructorAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contenidoService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContenidoDto: UpdateContenidoDto,
  ) {
    return this.contenidoService.update(id, updateContenidoDto);
  }

  @UseGuards(AdminAuthGuard)
  @Put('tema/:id')
  updatetema(@Param('id') id: string, @Body() temasDto: TemasDto) {
    return this.contenidoService.updatetema(id, temasDto);
  }

  @UseGuards(AdminAuthGuard)
  @Put('/agregarTema/:id')
  agregarTema(
    @Param('id') id: string,
    @Body() agregarTemaDto: AgregarTemaDtos,
  ) {
    return this.contenidoService.agregarTema(id, agregarTemaDto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('eliminar/:id')
  remove(@Param('id') id: string) {
    return this.contenidoService.remove(id);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('/competencias')
  deleteCompetencias(@Body() ids: string[]) {
    return this.contenidoService.deleteCompetencias(ids);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('tema/:id/:posicion')
  deleteTema(@Param('id') id: string, @Param('posicion') posicion: string) {
    return this.contenidoService.deleteTema(id, +posicion);
  }
}
