import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { WebsocketService } from './websocket-app/datafiles/datafiles.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly websocketService: WebsocketService) {}

  @Get()
  getHello(): string {
    this.websocketService.sendToClient({msg: "NEW HTTP REQUEST!"});
    return this.appService.getHello();
  }
}
