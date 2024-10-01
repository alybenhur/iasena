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
    { username: string; message: string; video?: string }[]
  > = new Map();
  private videoChunks = {};
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

  @SubscribeMessage('audio')
  async handleAudio(
    @MessageBody() data: { room: string; audio: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {

  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: { room: string; message: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.chatRooms.has(data.room)) {
      this.chatRooms.set(data.room, []);
    }
    const messageData = { username: data.username, message: data.message };
    this.chatRooms.get(data.room).push(messageData);

    this.wss.to(data.room).emit('chatHistory', this.chatRooms.get(data.room));

    const responseVideo: any = await this.sendTextToFlask(data.message);

    const video_base64 = responseVideo.data.videos;

    this.chatRooms.get(data.room).push({
      username: data.username,
      video: video_base64,
      message: 'videoSocket', // o deja en blanco o cualquier otra indicación
    });

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
    @MessageBody() data: { room: string; video: string; username: string }, // Asegúrate de que 'video' sea de tipo string
    @ConnectedSocket() client: Socket,
  ) {
    // video ya está en Base64, así que no es necesario convertirlo a Buffer y de vuelta a Base64
    const videoBase64 = data.video;

    // Guarda el video en la sala de chat
    this.chatRooms.get(data.room).push({
      username: data.username,
      video: videoBase64,
      message: 'videoSocket', // o deja en blanco o cualquier otra indicación
    });

    // Emitir el historial del chat
    this.wss.to(data.room).emit('chatHistory', this.chatRooms.get(data.room));

    // Enviar al endpoint Flask
    try {
      const respModel = await this.sendVideoToFlask(videoBase64);

      const messageData = {
        username: data.username,
        message: respModel.data['result'],
      };

      this.chatRooms.get(data.room).push(messageData);
      this.wss.to(data.room).emit('message', messageData);
      // Enviar el arreglo completo de mensajes
      this.wss.to(data.room).emit('chatHistory', this.chatRooms.get(data.room));
      console.log(typeof respModel.data);
    } catch (error) {
      console.error('Error al enviar el video a Flask:', error);
    }
  }

  @SubscribeMessage('video_chunk')
  async handleVideoChunk(
    @MessageBody()
    data: {
      room: string;
      username: string;
      chunk: number[];
      chunkIndex: number;
      totalChunks: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { room, username, chunk, chunkIndex, totalChunks } = data;
    // Usa el nombre de usuario como clave en lugar de la sala
    if (!this.videoChunks[username]) {
      this.videoChunks[username] = [];
    }

    // Guarda el fragmento de video en el índice correspondiente
    this.videoChunks[username][chunkIndex] = Buffer.from(new Uint8Array(chunk));

    // Verifica si todos los fragmentos del usuario han sido recibidos
    if (this.videoChunks[username].length === totalChunks) {
      const completeVideo = Buffer.concat(this.videoChunks[username]);

      // Limpia los fragmentos guardados para ese usuario
      delete this.videoChunks[username];

      // Procesa el video completo (ej. enviar a otro servicio)
      const videoBase64 = completeVideo.toString('base64');

      this.chatRooms.get(room).push({
        username: username,
        message: 'videoSocket',
        video: videoBase64,
      });
      this.wss.to(room).emit('chatHistory', this.chatRooms.get(room));

      const respModel = await this.sendVideoToFlask(videoBase64);

      // Agrega el video completo al historial de chat del usuario
      this.chatRooms.get(room).push({
        username: username,
        message: respModel.data['result'],
      });

      // Actualiza el historial de chat en la sala
      this.wss.to(room).emit('chatHistory', this.chatRooms.get(room));
    }
  }

  private async sendVideoToFlask(videoBase64: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.post('https://ai.tickapp.online/evaluate', {
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

  private async sendTextToFlask(word: string) {
    try {
      return await lastValueFrom(
        this.httpService.post('https://ai.tickapp.online/get_video', {
          word: word,
        }),
      );
    } catch (error) {
      console.error('Error al enviar word a Flask:', error.message);
    }
  }
}
