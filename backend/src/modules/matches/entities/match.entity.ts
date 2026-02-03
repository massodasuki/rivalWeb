import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { MatchParticipant } from './match-participant.entity';
import { MatchStat } from './match-stat.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'home_team_id', nullable: true })
  home_team_id: number;

  @Column({ name: 'away_team_id', nullable: true })
  away_team_id: number;

  @Column({ name: 'home_team_name', nullable: true, length: 100 })
  home_team_name: string;

  @Column({ name: 'away_team_name', nullable: true, length: 100 })
  away_team_name: string;

  @Column({ name: 'max_players', default: 10 })
  max_players: number;

  @Column({ nullable: true, length: 500 })
  description: string;

  @Column({ length: 50 })
  sport: string;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  location: string;

  @Column({ name: 'scheduled_at', type: 'timestamp' })
  scheduled_at: Date;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'home_team_id' })
  home_team: Team;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'away_team_id' })
  away_team: Team;

  @OneToMany(() => MatchParticipant, participant => participant.match)
  participants: MatchParticipant[];

  @OneToMany(() => MatchStat, stat => stat.match)
  stats: MatchStat[];
}
