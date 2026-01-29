import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { AchievementsService } from './achievements.service';

@Controller('achievements')
export class AchievementsController {
  constructor(private achievementsService: AchievementsService) {}

  @Get()
  async findAll() {
    return this.achievementsService.findAll();
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: number) {
    return this.achievementsService.findByUser(userId);
  }

  @Post()
  async create(@Body() data: { user_id: number; type?: string; value?: number }) {
    return this.achievementsService.create(data);
  }

  @Patch('update')
  async updateValue(@Body() data: { user_id: number; type: string; value: number }) {
    return this.achievementsService.updateValue(data.user_id, data.type, data.value);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.achievementsService.remove(id);
  }
}