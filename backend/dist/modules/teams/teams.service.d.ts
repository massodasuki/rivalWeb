import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';
export declare class TeamsService {
    private teamsRepository;
    private teamMembersRepository;
    constructor(teamsRepository: Repository<Team>, teamMembersRepository: Repository<TeamMember>);
    findAll(): Promise<Team[]>;
    findOne(id: number): Promise<Team>;
    create(data: Partial<Team>): Promise<Team>;
    addMember(teamId: number, userId: number, role?: string): Promise<TeamMember>;
    removeMember(teamId: number, userId: number): Promise<void>;
    update(id: number, updateData: Partial<Team>): Promise<Team>;
    remove(id: number): Promise<void>;
}
