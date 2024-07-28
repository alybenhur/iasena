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
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@WebSocketGateway({ cors: true })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  private rooms: Map<string, Set<string>> = new Map();
  private userRooms: Map<string, string> = new Map();
  private chatRooms: Map<
    string,
    { username: string; message: string; video?: Buffer }[]
  > = new Map();
  constructor(
    //  private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
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
    console.log('Se unio');
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
    console.log('Se desconecto');
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

  @SubscribeMessage('video')
  async handleImage(
    @MessageBody() data: { room: string; video: any; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    const video = Buffer.from(data.video);
    console.log(video);
    this.chatRooms.get(data.room).push({
      username: data.username,
      video: video,
      message: 'videoSocket', // or leave it empty or any other indication that it is an image
    });
    this.wss.to(data.room).emit('chatHistory', this.chatRooms.get(data.room));

    const videoBase64 = video.toString('base64');

    // Enviar al endpoint Flask
    const respModel = await this.sendVideoToFlask(videoBase64);

    console.log(respModel.data);
  }

  private async sendVideoToFlask(videoBase64: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.post('http://localhost:5000/evaluate', {
          threshold: 0.9, // Puedes ajustar este valor según sea necesario
          video_base64: videoBase64,
        }),
      );
      return response;
      console.log('Resultado de Flask:', response.data);
    } catch (error) {
      console.error('Error al enviar video a Flask:', error.message);
    }
  }
}
