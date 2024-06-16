import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { User } from 'src/users/schema/users.schema';

interface ConnectClients {
  [id: string]: {
    socket: Socket;
    user: string;
  };
}

@Injectable()
export class MessageService {
  private ConectClients: ConnectClients = {};

  registerClients(client: Socket, usuario: string) {
    this.ConectClients[client.id] = {
      socket: client,
      user: usuario,
    };
  }

  removeClients(clientid: string) {
    console.log('removiendo :', clientid);
    delete this.ConectClients[clientid];
  }

  clientsConnectAll(): number {
    return Object.keys(this.ConectClients).length;
  }
}
