import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Team } from './team.entity';
import { User } from '../../users/entities/user.entity';

@Entity('team_members')
@Unique(['team_id', 'user_id'])
export class TeamMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'team_id' })
  team_id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ default: 'player' })
  role: string;

  @CreateDateColumn({ name: 'joined_at' })
  joined_at: Date;

  @ManyToOne(() => Team, team => team.members)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}