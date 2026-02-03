import { Controller, Get, Param, Patch, Delete, Body, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: number) {
    return this.usersService.getStats(id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateData: Partial<User>): Promise<User> {
    return this.usersService.update(id, updateData);
  }

  @Patch(':id/notifications')
  async updateNotifications(@Param('id') id: number, @Body() data: Record<string, boolean>) {
    return this.usersService.updateNotifications(id, data);
  }

  @Patch(':id/privacy')
  async updatePrivacy(@Param('id') id: number, @Body() data: Record<string, boolean>) {
    return this.usersService.updatePrivacy(id, data);
  }

  @Post(':id/password')
  async updatePassword(@Param('id') id: number, @Body() data: { current_password?: string; new_password: string }) {
    return this.usersService.updatePassword(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id);
  }
}
