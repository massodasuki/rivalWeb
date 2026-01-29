import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get()
  async findAll() {
    return this.matchesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.matchesService.findOne(id);
  }

  @Post()
  async create(@Body() data: {
    home_team_id?: number;
    away_team_id?: number;
    sport: string;
    scheduled_at: string;
  }) {
    const matchData = {
      ...data,
      scheduled_at: new Date(data.scheduled_at),
    };
    return this.matchesService.create(matchData);
  }

  @Post(':id/participants')
  async addParticipant(@Param('id') id: number, @Body() body: { user_id: number; role?: string }) {
    return this.matchesService.addParticipant(id, body.user_id, body.role);
  }

  @Post(':id/stats')
  async updateStats(@Param('id') id: number, @Body() body: { user_id: number; goals?: number; assists?: number; rating?: number }) {
    return this.matchesService.updateStats(id, body.user_id, body);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: number, @Body() body: { status: string }) {
    return this.matchesService.updateStatus(id, body.status);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.matchesService.remove(id);
  }
}