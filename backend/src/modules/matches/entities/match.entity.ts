import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Team } from '../../teams/entities/team.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'home_team_id', nullable: true })
  home_team_id: number;

  @Column({ name: 'away_team_id', nullable: true })
  away_team_id: number;

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

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'home_team_id' })
  home_team: Team;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'away_team_id' })
  away_team: Team;
}
