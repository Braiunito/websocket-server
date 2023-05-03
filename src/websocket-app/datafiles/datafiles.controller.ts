import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { WebsocketService } from './datafiles.service';

@Controller('datafiles')
export class DatafilesController {
  constructor(private readonly websocketService: WebsocketService) {}

  @EventPattern('notifications')
  async handleNotificationsMsg(data: Record<string, unknown>) {
    this.websocketService.sendToClient(data);
  }

  @EventPattern('updates')
  async handleUpdatesMsg(data: Record<string, unknown>) {
    this.websocketService.sendToClient(data, this.websocketService.channels.updates);
  }

  @EventPattern('results')
  async handleResultsMsg(data: Record<string, unknown>) {
    this.websocketService.sendToClient(data, this.websocketService.channels.results);
  }
  
  @EventPattern('errors')
  async handleErrorMsg(data: Record<string, unknown>) {
    this.websocketService.sendToClient(data, this.websocketService.channels.errors);
  }
}
