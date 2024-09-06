import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateUserAdminDto,
  CreateUserDto,
  CreateUserRootDto,
} from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/users.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { rolEnum } from './schema/rol';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existeCorreo = await this.validarUsername(createUserDto.username);
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

  async validarUsername(username: string): Promise<boolean> {
    const user = await this.userModel.findOne({ username });
    if (user) {
      return true;
    }
    return false;
  }

  async findOne(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findAll() {
    return await this.userModel.find({
      rol: { $in: ['Instructor', 'Aprendiz'] },
    });
  }

  async findAdmin() {
    return await this.userModel.find({
      rol: rolEnum.Admin,
    });
  }

  async createUser(createUserDto: CreateUserDto) {
    const existeCorreo = await this.validarUsername(createUserDto.username);
    if (
      createUserDto.rol != rolEnum.Aprendiz &&
      createUserDto.rol != rolEnum.Instructor
    ) {
      return new BadRequestException(`El usuario no tiene permisos`);
    }
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

  async createUserAdmin(createUserDto: CreateUserAdminDto) {
    const existeCorreo = await this.validarUsername(createUserDto.username);

    if (existeCorreo) {
      return new BadRequestException(
        `El usuario con el correo ${createUserDto.username} ya existe`,
      );
    }

    const userBd = {
      ...createUserDto,
      password: bcrypt.hashSync(createUserDto.password, 10),
      rol: rolEnum.Admin,
    };

    return await this.userModel.create(userBd);
  }

  async createUserRoot(createUserDto: CreateUserRootDto) {
    if (createUserDto.key != this.configService.get<string>('KEY')) {
      return new UnauthorizedException();
    }

    const existeCorreo = await this.validarUsername(createUserDto.username);

    if (existeCorreo) {
      return new BadRequestException(
        `El usuario con el correo ${createUserDto.username} ya existe`,
      );
    }

    const userBd = {
      ...createUserDto,
      password: bcrypt.hashSync(createUserDto.password, 10),
      rol: rolEnum.Root,
    };

    return await this.userModel.create(userBd);
  }

  async delete(id: string) {
    return await this.userModel.findByIdAndDelete(id);
  }
}
