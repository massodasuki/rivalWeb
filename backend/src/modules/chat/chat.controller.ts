import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('rooms')
  async findAllRooms() {
    return this.chatService.findAllRooms();
  }

  @Get('rooms/:id')
  async findRoom(@Param('id') id: number) {
    return this.chatService.findRoom(id);
  }

  @Post('rooms')
  async createRoom(@Body() data: { type?: string; name?: string }) {
    return this.chatService.createRoom(data);
  }

  @Get('rooms/:id/messages')
  async getMessages(@Param('id') id: number) {
    return this.chatService.getMessages(id);
  }

  @Post('messages')
  async saveMessage(@Body() data: { room_id: number; sender_id: number; message: string }) {
    return this.chatService.saveMessage(data);
  }

  @Delete('rooms/:id')
  async removeRoom(@Param('id') id: number) {
    return this.chatService.removeRoom(id);
  }
}