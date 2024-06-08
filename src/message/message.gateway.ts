import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessageService } from './message.service';
import { Server, Socket } from 'socket.io';
import { MessageDto } from './dto/message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/strategies/interfaces/jwt-strategy.interface';

@WebSocketGateway({cors : true})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
 
  @WebSocketServer()  wss : Server;
  
  constructor(
     private readonly messageService: MessageService,
     private readonly jwtService : JwtService
    ) {}
 
  handleConnection(client: Socket) {
    let payload : JwtPayload
    const token = client.handshake.headers.authorization
    try{
      payload = this.jwtService.verify(token)
    
     }
    catch (error)
    {
        client.disconnect()
        return
    }
   
   this.messageService.registerClients(client,payload.username)
   this.wss.emit('clientsconnect', this.messageService.clientsConnectAll())
  }

  handleDisconnect(client: Socket) {
   this.messageService.removeClients(client.id)
   
  }

  @SubscribeMessage('msgToServer')
  onMensajeFromcleinte(client : Socket, data : MessageDto){
    client.broadcast.emit('message-server',{
      fullname : data.mensaje
    })

  }
}
