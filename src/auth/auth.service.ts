import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CreateAuthDto } from './dto/create-auth.dto';


@Injectable()
export class AuthService {
  constructor(
       @Inject(JwtStrategy) private jwtStrategy: JwtStrategy,
  ) {}

  async signIn(userSignIn: CreateAuthDto): Promise<any> {
    return await this.jwtStrategy.loginJwt({
      username: userSignIn.username,
      password: userSignIn.password,
    });
  }
  }
