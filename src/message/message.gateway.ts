import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/strategies/interfaces/jwt-strategy.interface';

@WebSocketGateway({ cors: true })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  private rooms: Map<string, Set<string>> = new Map();
  private userRooms: Map<string, string> = new Map();
  private chatRooms: Map<
    string,
    { username: string; message: string; image?: string }[]
  > = new Map();
  constructor(
    //  private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    let payload: JwtPayload;
    const token = client.handshake.headers.authorization;
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      client.disconnect();
      return;
    }
  }

  handleDisconnect(client: Socket) {
    this.rooms.forEach((users, room) => {
      if (users.delete(client.id)) {
        this.wss.to(room).emit('users', Array.from(users));
      }
    });
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { room: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.room);
    if (!this.rooms.has(data.room)) {
      this.rooms.set(data.room, new Set());
    }
    this.rooms.get(data.room).add(data.username);
    this.userRooms.set(data.username, data.room);
    if (!this.chatRooms.has(data.room)) {
      this.chatRooms.set(data.room, []);
    }
    this.wss.to(data.room).emit('users', Array.from(this.rooms.get(data.room)));
    // Enviar todos los mensajes anteriores al usuario que se une a la sala
    client.emit('chatHistory', this.chatRooms.get(data.room));
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { room: string; message: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.chatRooms.has(data.room)) {
      this.chatRooms.set(data.room, []);
    }
    const messageData = { username: data.username, message: data.message };
    this.chatRooms.get(data.room).push(messageData);
    this.wss.to(data.room).emit('message', messageData);
    // Enviar el arreglo completo de mensajes
    this.wss.to(data.room).emit('chatHistory', this.chatRooms.get(data.room));
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { room: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.room);
    if (this.rooms.has(data.room)) {
      this.rooms.get(data.room).delete(data.username);
      this.wss
        .to(data.room)
        .emit('users', Array.from(this.rooms.get(data.room)));
    }
  }

  @SubscribeMessage('getUserRoom')
  handleGetUserRoom(
    @MessageBody() data: { username: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = this.userRooms.get(data.username);
    client.emit('userRoom', { username: data.username, room });
  }

  @SubscribeMessage('image')
  handleImage(
    @MessageBody() data: { room: string; image: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.chatRooms.get(data.room).push({
      username: data.username,
      image: data.image,
      message: 'ImageSocket', // or leave it empty or any other indication that it is an image
    });
    this.wss.to(data.room).emit('chatHistory', this.chatRooms.get(data.room));
  }
}
