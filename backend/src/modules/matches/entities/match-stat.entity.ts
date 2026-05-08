import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Match } from './match.entity';
import { User } from '../../users/entities/user.entity';

@Entity('match_stats')
@Unique(['match_id', 'user_id'])
export class MatchStat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'match_id' })
  match_id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ default: 0 })
  goals: number;

  @Column({ default: 0 })
  assists: number;

  @Column({ nullable: true })
  rating: number;

  @ManyToOne(() => Match, match => match.stats)
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}