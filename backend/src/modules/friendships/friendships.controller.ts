import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { FriendshipsService } from './friendships.service';

@Controller('friendships')
export class FriendshipsController {
  constructor(private friendshipsService: FriendshipsService) {}

  @Get()
  async findAll() {
    return this.friendshipsService.findAll();
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: number) {
    return this.friendshipsService.findByUser(userId);
  }

  @Post()
  async create(@Body() body: { user_id: number; friend_id: number }) {
    return this.friendshipsService.create(body.user_id, body.friend_id);
  }

  @Patch(':id')
  async updateStatus(@Param('id') id: number, @Body() body: { status: string }) {
    return this.friendshipsService.updateStatus(id, body.status);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.friendshipsService.remove(id);
  }
}