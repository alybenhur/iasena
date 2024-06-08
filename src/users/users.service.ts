import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/users.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto) {
    const existeCorreo = await this.validarCorreo(createUserDto.username);
    if (existeCorreo) {
      return new BadRequestException(
        `El usuario con el correo ${createUserDto.username} ya existe`,
      );
    }

    const userBd = {
      ...createUserDto,
      password: bcrypt.hashSync(createUserDto.password, 10),
    };

    return await this.userModel.create(userBd);
  }

  async validarCorreo(username: string): Promise<boolean> {
    const user = await this.userModel.findOne({ username });
    if (user) {
      return true;
    }
    return false;
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(username: string) : Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
    
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
