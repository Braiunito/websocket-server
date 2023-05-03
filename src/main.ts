import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WebsocketService } from './websocket-app/datafiles/datafiles.service';
import { WebSocket } from 'ws';
import * as https from 'https';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as fs from 'fs';

async function bootstrap() {
  /** Se usa el concepto de App Hibrida para que el microservicio funcione 
   * como tal en la aplicacion, y a su vez pueda ser expuesto en un puerto HTTP/HTTPS...
   */
  const myMicroservice = await NestFactory.create(AppModule);
  
  // Se inyecta el micro servicio
  myMicroservice.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST,
      port: 6379,
    },
  });

  // Se inician los microservicios conectados.
  myMicroservice.startAllMicroservices();

  const websocketService = myMicroservice.get(WebsocketService);
  const port = process.env.WEBSOCKET_PORT;

  console.log('Running: HTTP Server + Microservice Application...')
  await myMicroservice.listen(80).then(() => {
    const server = https.createServer({
      cert: fs.readFileSync('/certs/cert.crt'),
      key: fs.readFileSync('/certs/cert.pem'),
    });

    const wsServer = new WebSocket.Server({ server });
    wsServer._server.listen(port);
    websocketService.handleRequest(wsServer);

    console.log(`Running: Websocket server on wss://0.0.0.0:${port}`);
  });
  
}

bootstrap();