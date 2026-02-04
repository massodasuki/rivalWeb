import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('api/teams')
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

  @Get(':id/members')
  async getMembers(@Param('id') id: number) {
    return this.teamsService.getTeamMembers(id);
  }

  @Get(':id/invitations')
  async getTeamInvitations(@Param('id') id: number) {
    return this.teamsService.getTeamInvitations(id);
  }

  @Get('user/invitations')
  @UseGuards(JwtAuthGuard)
  async getUserInvitations(@Req() req: Request) {
    const user = (req as any).user;
    return this.teamsService.getUserInvitations(user.email);
  }

  @Post()
  async create(@Body() data: { name: string; sport: string; captain_id?: number }) {
    return this.teamsService.create(data);
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  async addMember(@Param('id') id: number, @Body() body: { user_id: number; role?: string }) {
    return this.teamsService.addMember(id, body.user_id, body.role);
  }

  @Post(':id/invite-by-email')
  @UseGuards(JwtAuthGuard)
  async inviteByEmail(
    @Param('id') id: number,
    @Body() body: { email: string },
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.teamsService.inviteByEmail(id, body.email, user.id);
  }

  @Post('invites/:inviteId/accept')
  @UseGuards(JwtAuthGuard)
  async acceptInvite(@Param('inviteId') inviteId: number, @Req() req: Request) {
    const user = (req as any).user;
    return this.teamsService.acceptInvite(inviteId, user.id);
  }

  @Post('invites/:inviteId/decline')
  @UseGuards(JwtAuthGuard)
  async declineInvite(@Param('inviteId') inviteId: number, @Req() req: Request) {
    const user = (req as any).user;
    return this.teamsService.declineInvite(inviteId, user.id);
  }

  @Delete('invites/:inviteId')
  @UseGuards(JwtAuthGuard)
  async cancelInvitation(@Param('inviteId') inviteId: number, @Req() req: Request) {
    const user = (req as any).user;
    return this.teamsService.cancelInvitation(inviteId, user.id);
  }

  @Post(':id/join-requests')
  async requestJoin(@Param('id') id: number, @Body() body: { user_id: number; message?: string }) {
    return this.teamsService.requestJoin(id, body.user_id, body.message);
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
