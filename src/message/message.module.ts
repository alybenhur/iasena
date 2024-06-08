import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  providers: [MessageGateway, MessageService],
  imports : [AuthModule]
})
export class MessageModule {}
