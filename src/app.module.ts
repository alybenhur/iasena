import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageModule } from './message/message.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
  MongooseModule.forRoot('mongodb://root:12345@ac-xfzwvbk-shard-00-00.kkgtidf.mongodb.net:27017,ac-xfzwvbk-shard-00-01.kkgtidf.mongodb.net:27017,ac-xfzwvbk-shard-00-02.kkgtidf.mongodb.net:27017/iasenas?authSource=admin&replicaSet=atlas-9o4jeb-shard-0&readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=true'),
  MessageModule, AuthModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
