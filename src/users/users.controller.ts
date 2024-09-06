import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserAdminDto,
  CreateUserDto,
  CreateUserRootDto,
} from './dto/create-user.dto';
import { AdminAuthGuard } from 'src/guard/admin.guard';
import { RootAuthGuard } from 'src/guard/root.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AdminAuthGuard)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @UseGuards(RootAuthGuard)
  @Post('/admin')
  createAdmin(@Body() createUserAdminDto: CreateUserAdminDto) {
    return this.usersService.createUserAdmin(createUserAdminDto);
  }

  @Post('/root')
  createRoot(@Body() createUserRootDto: CreateUserRootDto) {
    console.log('root');
    return this.usersService.createUserRoot(createUserRootDto);
  }

  @UseGuards(AdminAuthGuard)
  @Get()
  findUser() {
    return this.usersService.findAll();
  }

  @UseGuards(RootAuthGuard)
  @Get('/admin')
  findAdmin() {
    return this.usersService.findAdmin();
  }

  @UseGuards(AdminAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
