import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  async findAll() {
    return this.teamsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.teamsService.findOne(id);
  }

  @Post()
  async create(@Body() data: { name: string; sport: string; captain_id?: number }) {
    return this.teamsService.create(data);
  }

  @Post(':id/members')
  async addMember(@Param('id') id: number, @Body() body: { user_id: number; role?: string }) {
    return this.teamsService.addMember(id, body.user_id, body.role);
  }

  @Post(':id/join-requests')
  async requestJoin(@Param('id') id: number, @Body() body: { user_id: number; message?: string }) {
    return this.teamsService.requestJoin(id, body.user_id, body.message);
  }

  @Post('invites/:inviteId/accept')
  async acceptInvite(@Param('inviteId') inviteId: number) {
    return this.teamsService.acceptInvite(inviteId);
  }

  @Post('invites/:inviteId/decline')
  async declineInvite(@Param('inviteId') inviteId: number) {
    return this.teamsService.declineInvite(inviteId);
  }

  @Delete(':id/members/:userId')
  async removeMember(@Param('id') id: number, @Param('userId') userId: number) {
    return this.teamsService.removeMember(id, userId);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() data: Partial<{ name: string; sport: string; captain_id: number }>) {
    return this.teamsService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.teamsService.remove(id);
  }
}
