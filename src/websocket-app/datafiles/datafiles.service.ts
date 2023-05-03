import { Injectable, Inject } from '@nestjs/common';
import { Server } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import * as redis from 'redis';
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class WebsocketService {
  private clients: Map<WebSocket, string>;
  public readonly channels = {
    updates: 'updates',
    results: 'results',
    connection: 'connection',
    notifications: 'notifications',
    errors: 'errors'
  };

  constructor(@Inject('PROCESSORS_SERVICE') private client: ClientProxy) {
    this.clients = new Map();
    this.debugClientConnected();
  }

  handleRequest(server: Server) {
    server.on('connection', (socket) => {
      const clientId = uuidv4();
      this.clients.set(socket, clientId);
      const msg = {
        clientId: clientId,
      }
      
      console.log('CLIENTE CONECTADO: ', clientId);
      this.broadcast(msg, this.channels.connection);

      socket.on('close', () => {
        this.disconnectHandler(socket, clientId);
      });
    });
  }

  public sendToClient(data: Record<string, unknown>, channel: string = this.channels.notifications): void {
    const clientId = data.clientId ?? null;
    const message = data.message ?? null;
    
    const stringed = JSON.stringify({channel: channel, message: message, clientId: clientId});
    const strDebugLen = stringed.length;
    console.log("from sendToClient: str(" + (strDebugLen > 300 ? strDebugLen : stringed) + ") len. Clients connecteds: " + this.clients.size);
    
    this.clients.forEach((id, client) => {
      if (!clientId || clientId == id) {
        client.send(stringed);
      }
    });
  }

  public broadcast(data: Record<string, unknown>, channel: string = this.channels.notifications): void {
    const clientId = data.clientId ?? null;
    const message = data.message ?? null;
    
    const stringed = JSON.stringify({channel: channel, message: message, clientId: clientId});
    console.log("from broadcast: " + stringed + ". Clients connecteds: " + this.clients.size);
    
    this.clients.forEach((id, client) => {
      if (!clientId || clientId == id) {
        client.send(stringed);
      }
    });
  }

  private disconnectHandler(socket: any, clientId: string) {
    this.clients.delete(socket);

    const channel = 'messages';
    const message = {
      _symfony_serializer_class: 'App\Message\DisconnectMessage',
      data: {
        data: clientId,
      },
    };

    this.client.emit(channel, JSON.stringify(message));
    console.log(`Connection ${clientId} has disconnected`);
  }

  private debugClientConnected() {
    this.client.connect().then(() => {
      console.log('Redis client connected successfully!');
    }).catch((error) => {
      console.error(`Redis client connection failed: ${error}`);
    });
  }
}