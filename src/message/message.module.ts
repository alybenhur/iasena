import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { AuthModule } from '../auth/auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [MessageGateway, MessageService],
  imports: [AuthModule, HttpModule],
})
export class MessageModule {}
