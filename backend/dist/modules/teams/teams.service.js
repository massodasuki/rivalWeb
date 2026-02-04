"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const team_entity_1 = require("./entities/team.entity");
const team_member_entity_1 = require("./entities/team-member.entity");
const team_invitation_entity_1 = require("./entities/team-invitation.entity");
const users_service_1 = require("../users/users.service");
let TeamsService = class TeamsService {
    constructor(teamsRepository, teamMembersRepository, teamInvitationsRepository, usersService) {
        this.teamsRepository = teamsRepository;
        this.teamMembersRepository = teamMembersRepository;
        this.teamInvitationsRepository = teamInvitationsRepository;
        this.usersService = usersService;
    }
    async findAll() {
        return this.teamsRepository.find({ relations: ['captain', 'members', 'members.user'] });
    }
    async findOne(id) {
        const team = await this.teamsRepository.findOne({ where: { id }, relations: ['captain', 'members', 'members.user'] });
        if (!team) {
            throw new common_1.NotFoundException(`Team with ID ${id} not found`);
        }
        return team;
    }
    async create(data) {
        console.log('TeamsService.create called with data:', data);
        if (!data.name || !data.sport) {
            throw new Error('Team name and sport are required');
        }
        if (data.captain_id) {
            try {
                await this.usersService.findOne(data.captain_id);
            }
            catch (error) {
                console.error('Captain user not found:', data.captain_id);
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
    async addMember(teamId, userId, role = 'player') {
        const existingMember = await this.teamMembersRepository.findOne({
            where: { team_id: teamId, user_id: userId },
        });
        if (existingMember) {
            throw new common_1.BadRequestException('User is already a member of this team');
        }
        const member = this.teamMembersRepository.create({
            team_id: teamId,
            user_id: userId,
            role,
        });
        return this.teamMembersRepository.save(member);
    }
    async removeMember(teamId, userId) {
        await this.teamMembersRepository.delete({ team_id: teamId, user_id: userId });
    }
    async update(id, updateData) {
        await this.findOne(id);
        await this.teamsRepository.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id) {
        const result = await this.teamsRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Team with ID ${id} not found`);
        }
    }
    async inviteByEmail(teamId, email, inviterId) {
        await this.findOne(teamId);
        const invitedUser = await this.usersService.findByEmail(email);
        if (!invitedUser) {
            throw new common_1.NotFoundException(`User with email ${email} not found`);
        }
        const existingMember = await this.teamMembersRepository.findOne({
            where: { team_id: teamId, user_id: invitedUser.id },
        });
        if (existingMember) {
            throw new common_1.BadRequestException('User is already a member of this team');
        }
        const existingInvitation = await this.teamInvitationsRepository.findOne({
            where: { team_id: teamId, invited_email: email, status: 'pending' },
        });
        if (existingInvitation) {
            throw new common_1.BadRequestException('There is already a pending invitation for this email');
        }
        const invitation = this.teamInvitationsRepository.create({
            team_id: teamId,
            invited_email: email,
            inviter_id: inviterId,
            status: 'pending',
        });
        return this.teamInvitationsRepository.save(invitation);
    }
    async acceptInvite(inviteId, userId) {
        const invitation = await this.teamInvitationsRepository.findOne({
            where: { id: inviteId },
            relations: ['team'],
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (invitation.status !== 'pending') {
            throw new common_1.BadRequestException('Invitation is not pending');
        }
        const user = await this.usersService.findOne(userId);
        if (user.email !== invitation.invited_email) {
            throw new common_1.BadRequestException('This invitation was not sent to your email');
        }
        const member = await this.addMember(invitation.team_id, userId, 'player');
        await this.teamInvitationsRepository.update(inviteId, { status: 'accepted' });
        return member;
    }
    async declineInvite(inviteId, userId) {
        const invitation = await this.teamInvitationsRepository.findOne({
            where: { id: inviteId },
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        if (invitation.status !== 'pending') {
            throw new common_1.BadRequestException('Invitation is not pending');
        }
        const user = await this.usersService.findOne(userId);
        if (user.email !== invitation.invited_email) {
            throw new common_1.BadRequestException('This invitation was not sent to your email');
        }
        await this.teamInvitationsRepository.update(inviteId, { status: 'declined' });
        return { status: 'invite_declined' };
    }
    async getTeamInvitations(teamId) {
        return this.teamInvitationsRepository.find({
            where: { team_id: teamId, status: 'pending' },
            relations: ['inviter'],
            order: { created_at: 'DESC' },
        });
    }
    async getUserInvitations(email) {
        return this.teamInvitationsRepository.find({
            where: { invited_email: email, status: 'pending' },
            relations: ['team', 'inviter'],
            order: { created_at: 'DESC' },
        });
    }
    async cancelInvitation(inviteId, userId) {
        const invitation = await this.teamInvitationsRepository.findOne({
            where: { id: inviteId },
            relations: ['team'],
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        const team = await this.findOne(invitation.team_id);
        if (invitation.inviter_id !== userId && team.captain_id !== userId) {
            throw new common_1.BadRequestException('You cannot cancel this invitation');
        }
        await this.teamInvitationsRepository.delete(inviteId);
        return { status: 'invitation_cancelled' };
    }
    async requestJoin(teamId, userId, message) {
        await this.findOne(teamId);
        return { status: 'request_received', message: message || '' };
    }
    async getTeamMembers(teamId) {
        return this.teamMembersRepository.find({
            where: { team_id: teamId },
            relations: ['user'],
            order: { joined_at: 'ASC' },
        });
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(team_entity_1.Team)),
    __param(1, (0, typeorm_1.InjectRepository)(team_member_entity_1.TeamMember)),
    __param(2, (0, typeorm_1.InjectRepository)(team_invitation_entity_1.TeamInvitation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], TeamsService);
//# sourceMappingURL=teams.service.js.map