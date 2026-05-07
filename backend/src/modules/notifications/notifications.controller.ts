import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async findAll() {
    return this.notificationsService.findAll();
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: number) {
    return this.notificationsService.findByUser(userId);
  }

  @Post()
  async create(@Body() data: { user_id: number; type?: string; message?: string }) {
    return this.notificationsService.create(data);
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: number) {
    return this.notificationsService.markAsRead(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.notificationsService.remove(id);
  }
}
