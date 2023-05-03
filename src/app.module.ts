import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebsocketAppModule } from './websocket-app/websocket-app.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [WebsocketAppModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
