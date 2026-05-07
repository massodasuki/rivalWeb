import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';
import { TeamInvitation } from './entities/team-invitation.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private teamMembersRepository: Repository<TeamMember>,
    @InjectRepository(TeamInvitation)
    private teamInvitationsRepository: Repository<TeamInvitation>,
    private usersService: UsersService,
  ) {}

  async findAll(): Promise<Team[]> {
    return this.teamsRepository.find({ relations: ['captain', 'members', 'members.user'] });
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.teamsRepository.findOne({ where: { id }, relations: ['captain', 'members', 'members.user'] });
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return team;
  }

  async create(data: Partial<Team>): Promise<Team> {
    console.log('TeamsService.create called with data:', data);
    
    // Validate required fields
    if (!data.name || !data.sport) {
      throw new Error('Team name and sport are required');
    }
    
    // If captain_id is provided, verify the user exists
    if (data.captain_id) {
      try {
        await this.usersService.findOne(data.captain_id);
      } catch (error) {
        console.error('Captain user not found:', data.captain_id);
        // We'll still create the team without a captain
        const { captain_id, ...teamData } = data;
        const team = this.teamsRepository.create(teamData);
        const savedTeam = await this.teamsRepository.save(team);
        console.log('Saved team without captain:', savedTeam);
        return savedTeam;
      }
    }
    
    const team = this.teamsRepository.create(data);
    console.log('Created team entity:', team);
    const savedTeam = await this.teamsRepository.save(team);
    console.log('Saved team:', savedTeam);
    return savedTeam;
  }

  async addMember(teamId: number, userId: number, role: string = 'player'): Promise<TeamMember> {
    // Check if already a member
    const existingMember = await this.teamMembersRepository.findOne({
      where: { team_id: teamId, user_id: userId },
    });
    if (existingMember) {
      throw new BadRequestException('User is already a member of this team');
    }
    
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

  // Invite a user by email
  async inviteByEmail(teamId: number, email: string, inviterId: number): Promise<TeamInvitation> {
    await this.findOne(teamId);
    
    // Check if user with this email exists
    const invitedUser = await this.usersService.findByEmail(email);
    if (!invitedUser) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    
    // Check if already a member
    const existingMember = await this.teamMembersRepository.findOne({
      where: { team_id: teamId, user_id: invitedUser.id },
    });
    if (existingMember) {
      throw new BadRequestException('User is already a member of this team');
    }
    
    // Check if there's already a pending invitation
    const existingInvitation = await this.teamInvitationsRepository.findOne({
      where: { team_id: teamId, invited_email: email, status: 'pending' },
    });
    if (existingInvitation) {
      throw new BadRequestException('There is already a pending invitation for this email');
    }
    
    const invitation = this.teamInvitationsRepository.create({
      team_id: teamId,
      invited_email: email,
      inviter_id: inviterId,
      status: 'pending',
    });
    return this.teamInvitationsRepository.save(invitation);
  }

  // Accept an invitation - adds user to team
  async acceptInvite(inviteId: number, userId: number): Promise<TeamMember> {
    const invitation = await this.teamInvitationsRepository.findOne({
      where: { id: inviteId },
      relations: ['team'],
    });
    
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    
    if (invitation.status !== 'pending') {
      throw new BadRequestException('Invitation is not pending');
    }
    
    // Verify user's email matches invitation
    const user = await this.usersService.findOne(userId);
    if (user.email !== invitation.invited_email) {
      throw new BadRequestException('This invitation was not sent to your email');
    }
    
    // Add to team
    const member = await this.addMember(invitation.team_id, userId, 'player');
    
    // Update invitation status
    await this.teamInvitationsRepository.update(inviteId, { status: 'accepted' });
    
    return member;
  }

  // Decline an invitation
  async declineInvite(inviteId: number, userId: number): Promise<{ status: string }> {
    const invitation = await this.teamInvitationsRepository.findOne({
      where: { id: inviteId },
    });
    
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    
    if (invitation.status !== 'pending') {
      throw new BadRequestException('Invitation is not pending');
    }
    
    // Verify user's email matches invitation
    const user = await this.usersService.findOne(userId);
    if (user.email !== invitation.invited_email) {
      throw new BadRequestException('This invitation was not sent to your email');
    }
    
    await this.teamInvitationsRepository.update(inviteId, { status: 'declined' });
    return { status: 'invite_declined' };
  }

  // Get pending invitations for a team
  async getTeamInvitations(teamId: number): Promise<TeamInvitation[]> {
    return this.teamInvitationsRepository.find({
      where: { team_id: teamId, status: 'pending' },
      relations: ['inviter'],
      order: { created_at: 'DESC' },
    });
  }

  // Get user's pending invitations
  async getUserInvitations(email: string): Promise<TeamInvitation[]> {
    return this.teamInvitationsRepository.find({
      where: { invited_email: email, status: 'pending' },
      relations: ['team', 'inviter'],
      order: { created_at: 'DESC' },
    });
  }

  // Cancel an invitation
  async cancelInvitation(inviteId: number, userId: number): Promise<{ status: string }> {
    const invitation = await this.teamInvitationsRepository.findOne({
      where: { id: inviteId },
      relations: ['team'],
    });
    
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    
    // Only inviter or team captain can cancel
    const team = await this.findOne(invitation.team_id);
    if (invitation.inviter_id !== userId && team.captain_id !== userId) {
      throw new BadRequestException('You cannot cancel this invitation');
    }
    
    await this.teamInvitationsRepository.delete(inviteId);
    return { status: 'invitation_cancelled' };
  }

  async requestJoin(teamId: number, userId: number, message?: string): Promise<{ status: string; message?: string }> {
    await this.findOne(teamId);
    return { status: 'request_received', message: message || '' };
  }

  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    return this.teamMembersRepository.find({
      where: { team_id: teamId },
      relations: ['user'],
      order: { joined_at: 'ASC' },
    });
  }
}
