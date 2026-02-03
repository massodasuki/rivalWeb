import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private teamMembersRepository: Repository<TeamMember>,
  ) {}

  async findAll(): Promise<Team[]> {
    return this.teamsRepository.find({ relations: ['captain', 'members'] });
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.teamsRepository.findOne({ where: { id }, relations: ['captain', 'members'] });
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return team;
  }

  async create(data: Partial<Team>): Promise<Team> {
    const team = this.teamsRepository.create(data);
    return this.teamsRepository.save(team);
  }

  async addMember(teamId: number, userId: number, role: string = 'player'): Promise<TeamMember> {
    const member = this.teamMembersRepository.create({
      team_id: teamId,
      user_id: userId,
      role,
    });
    return this.teamMembersRepository.save(member);
  }

  async removeMember(teamId: number, userId: number): Promise<void> {
    await this.teamMembersRepository.delete({ team_id: teamId, user_id: userId });
  }

  async update(id: number, updateData: Partial<Team>): Promise<Team> {
    await this.findOne(id);
    await this.teamsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.teamsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
  }

  async requestJoin(teamId: number, userId: number, message?: string): Promise<{ status: string; message?: string }> {
    await this.findOne(teamId);
    return { status: 'request_received', message: message || '' };
  }

  async acceptInvite(inviteId: number): Promise<{ status: string; inviteId: number }> {
    return { status: 'invite_accepted', inviteId };
  }

  async declineInvite(inviteId: number): Promise<{ status: string; inviteId: number }> {
    return { status: 'invite_declined', inviteId };
  }
}
