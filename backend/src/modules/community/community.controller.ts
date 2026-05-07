import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@UseGuards(JwtAuthGuard)
@Controller('community')
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  @Public()
  @Get()
  async findAll() {
    return this.communityService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.communityService.findOne(id);
  }

  @Post()
  async create(@Body() data: { user_id: number; title?: string; content?: string; type?: string }) {
    return this.communityService.create(data);
  }

  @Post(':id/replies')
  async reply(@Param('id') id: number, @Body() data: { user_id: number; content: string }) {
    return this.communityService.reply(id, data);
  }

  @Post('events/register')
  async registerEvent(@Body() data: { user_id: number; event_id: number }) {
    return this.communityService.registerEvent(data);
  }

  @Post('events/join')
  async joinEvent(@Body() data: { user_id: number; event_id: number }) {
    return this.communityService.joinEvent(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() data: Partial<{ title: string; content: string; type: string }>,
  ) {
    return this.communityService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.communityService.remove(id);
  }
}
