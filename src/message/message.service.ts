import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { User } from 'src/users/schema/users.schema';
/*
interface  ConnectClients {
 [id : string] : {
  socket : Socket,
  user : string
}
}
*/
type UserSocket = {
  socket: Socket;
  username: string;
};

/*
interface Client {
  id: string;
  username: string;
}*/

@Injectable()
export class MessageService {
  // private rooms: Map<string, Set<UserSocket>> = new Map();
  rooms = new Map<string, Set<UserSocket>>();

  // private ConectClients : ConnectClients = {}

  /*registerClients(client : Socket, usuario : string){

       this.ConectClients[client.id] = {
          socket : client,
          user : usuario
       
    }
    }*/

  createRoom(roomName: string): void {
    this.rooms.set(roomName, new Set());
    console.log(this.rooms);
  }

  getRoomNames(): string[] {
    return Array.from(this.rooms.keys());
  }

  /* joinRoom(socket: Socket, roomName: string, username: string): void {
      const room = this.rooms.get(roomName);
      console.log(room)
      if (!room) {
        throw new Error(`Room ${roomName} not found`);
      }
      const userSocket: UserSocket = { socket, username };
      room.add(userSocket);
    }
*/
  /*  createRoom(client: Socket,  room: string, username: string ) {
      client.join(room);
      if (!this.rooms.has(room)) {
        this.rooms.set(room, new Set<Client>());
      }
      this.rooms.get(room).add({ id: client.id, username });
      console.log(`Client ${username} created room ${room}`);
    }*/

  /* 
    joinRoom(client: Socket,  room: string, username: string) {
      client.join(room);
      if (!this.rooms.has(room)) {
        this.rooms.set(room, new Set<Client>());
      }
      this.rooms.get(room).add({ id: client.id, username });
      console.log(`Client ${username} joined room ${room}`);
    }*/

  /*
    sendMessageToRoom(client: Socket,  room: string, message: string ) {
      
      const user = this.getUserFromRoom(client.id, room);
      if (user) {
        client.to(room).emit('newMessage', { username: user.username, message });
      }
    }
/*
    private getUserFromRoom(clientId: string, room: string): Client | undefined {
      const clients = this.rooms.get(room);
      if (clients) {
        return Array.from(clients).find(user => user.id === clientId);
      }
      return undefined;
    }
   /* sendMessageToRoom(roomName: string, message: any): void {
     console.log(this.rooms)
      const room = this.rooms.get(message.roomName);
      console.log(room)
      if (!room) {
        throw new Error(`Room ${message.roomName} not found`);
      }
      room.forEach((userSocket) =>
        userSocket.socket.emit('message', { username: userSocket.username, message }),
      );
    }*/

  /* disconnectFromRoom(socket: Socket, roomName: string): void {
      const room = this.rooms.get(roomName);
      if (!room) {
        throw new Error(`Room ${roomName} not found`);
      }
      const userSocket = Array.from(room.values()).find(
        (userSocket) => userSocket.socket.id === socket.id,
      );
      if (!userSocket) {
        throw new Error(`User not found in room ${roomName}`);
      }
      room.delete(userSocket);
      socket.leave(roomName);
    }*/

  /*  sendMessageToUserInRoom(roomName: string, username: string, message: any): void {
      const room = this.rooms.get(roomName);
      if (!room) {
        throw new Error(`Room ${roomName} not found`);
      }
      const userSocket = Array.from(room.values()).find(
        (userSocket) => userSocket.username === username,
      );
      if (!userSocket) {
        throw new Error(`User ${username} not found in room ${roomName}`);
      }
      userSocket.socket.emit('message', { username, message });
    }
*/
  /*  removeClients(clientid : string)
    {
      console.log('removiendo :', clientid)
      delete this.ConectClients[clientid]
    }

    clientsConnectAll() : number{
      return Object.keys(this.ConectClients).length
    }*/
}
