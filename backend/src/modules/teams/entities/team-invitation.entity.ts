import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Team } from './team.entity';
import { User } from '../../users/entities/user.entity';

@Entity('team_invitations')
export class TeamInvitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'team_id' })
  team_id: number;

  @Column({ name: 'invited_email' })
  invited_email: string;

  @Column({ name: 'inviter_id' })
  inviter_id: number;

  @Column({ default: 'pending' })
  status: string; // pending, accepted, declined

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => Team, team => team.invitations)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'inviter_id' })
  inviter: User;
}
