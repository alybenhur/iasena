import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../users/schema/users.schema';
import { JwtPayload } from './interfaces/jwt-strategy.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @Inject(JwtService) private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get<string>('SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(
    payload: JwtPayload,
  ): Promise<User | { access_token: string }> {
    const { username } = payload;
    const userBd = await this.userModel.findOne({ username });
    if (!userBd) {
      throw new UnauthorizedException('El usuario no esta registrado');
    }

    const payloadZ = {
      sub: userBd.id,
      username: userBd.username,
    };
    const userNew: any = userBd;
    userNew.access_token = await this.jwtService.signAsync(payloadZ);
    return userNew;
  }

  async loginJwt(payload: JwtPayload): Promise<any> {
    const { username, password } = payload;
    console.log(password);
    const userBd: any = await this.userModel
      .findOne({ username })
      .select(['username', 'password']);
    if (!userBd) {
      throw new UnauthorizedException('El usuario no esta registrado');
    } else if (!bcrypt.compareSync(password, userBd.password)) {
      throw new UnauthorizedException('La contraseña es incorrecta');
    }
    const payloadZ = {
      sub: userBd.id,
      username: userBd.username,
    };
    userBd.password = null;
    const userReturn = {
      id: userBd._id,
      username: userBd.username,
      access_token: await this.jwtService.signAsync(payloadZ),
    };
    return userReturn;
  }
}
