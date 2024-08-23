import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageModule } from './message/message.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { ContenidoModule } from './contenido/contenido.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      'mongodb+srv://root:12345@cluster0.kkgtidf.mongodb.net/iasenas',
    ),
    MessageModule,
    AuthModule,
    UsersModule,
    ContenidoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
