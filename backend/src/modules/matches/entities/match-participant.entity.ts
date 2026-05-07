import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Match } from './match.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('match_participants')
@Unique(['match_id', 'user_id'])
export class MatchParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'match_id' })
  match_id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ default: 'player' })
  role: string;

  @CreateDateColumn({ name: 'joined_at' })
  joined_at: Date;

  @ManyToOne(() => Match, match => match.participants)
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
