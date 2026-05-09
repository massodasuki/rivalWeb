import { Controller, Get, Post, Patch, Delete, Param, Body, Logger, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@UseGuards(JwtAuthGuard)
@Controller('matches')
export class MatchesController {
  private readonly logger = new Logger(MatchesController.name);

  constructor(private matchesService: MatchesService) {}

  @Public()
  @Get()
  async findAll(
    @Query('participant_id') participantId?: string,
    @Query('created_by') createdBy?: string,
  ) {
    this.logger.log('GET /matches - Fetching all matches');

    let pid: number | undefined;
    let cid: number | undefined;

    if (participantId !== undefined) {
      pid = parseInt(participantId, 10);
      if (isNaN(pid) || pid <= 0) {
        throw new BadRequestException('participant_id must be a positive integer');
      }
    }

    if (createdBy !== undefined) {
      cid = parseInt(createdBy, 10);
      if (isNaN(cid) || cid <= 0) {
        throw new BadRequestException('created_by must be a positive integer');
      }
    }

    return this.matchesService.findAll({ participantId: pid, createdBy: cid });
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: number) {
    this.logger.log(`GET /matches/${id} - Fetching match`);
    return this.matchesService.findOne(id);
  }

  @Post()
  async create(
    @Body()
    data: {
      home_team_id?: number;
      away_team_id?: number;
      home_team?: string;
      away_team?: string;
      sport: string;
      scheduled_at: string;
      location?: string;
      max_players?: number;
      description?: string;
    },
  ) {
    this.logger.log(`POST /matches - Creating match with data:`, data);
    try {
      const matchData = {
        home_team_id: data.home_team_id,
        away_team_id: data.away_team_id,
        home_team_name: data.home_team,
        away_team_name: data.away_team,
        sport: data.sport,
        scheduled_at: new Date(data.scheduled_at),
        location: data.location,
        max_players: data.max_players || 10,
        description: data.description,
      };
      const result = await this.matchesService.create(matchData);
      this.logger.log(`Match created successfully:`, result);
      return result;
    } catch (error) {
      this.logger.error(`Error creating match:`, error);
      throw error;
    }
  }

  @Post(':id/participants')
  async addParticipant(
    @Param('id') id: number,
    @Body() body: { user_id: number; role?: string },
  ) {
    this.logger.log(`POST /matches/${id}/participants - Adding participant:`, body);
    return this.matchesService.addParticipant(id, body.user_id, body.role);
  }

  @Post(':id/stats')
  async updateStats(
    @Param('id') id: number,
    @Body() body: { user_id: number; goals?: number; assists?: number; rating?: number },
  ) {
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
