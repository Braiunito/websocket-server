import { Module } from '@nestjs/common';
import { WebsocketService } from './datafiles/datafiles.service';
import { DatafilesController } from './datafiles/datafiles.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: 'PROCESSORS_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOST,
          port: 6379,
        }
      },
    ]),
  ],
  providers: [WebsocketService, ConfigService],
  controllers: [DatafilesController],
  exports: [WebsocketService],
})
export class WebsocketAppModule {}
