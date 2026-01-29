import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { CommunityService } from './community.service';

@Controller('community')
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  @Get()
  async findAll() {
    return this.communityService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.communityService.findOne(id);
  }

  @Post()
  async create(@Body() data: { user_id: number; title?: string; content?: string; type?: string }) {
    return this.communityService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() data: Partial<{ title: string; content: string; type: string }>) {
    return this.communityService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.communityService.remove(id);
  }
}