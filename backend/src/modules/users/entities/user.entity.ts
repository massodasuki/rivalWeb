import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255, name: 'password_hash' })
  password_hash: string;

  @Column({ nullable: true, name: 'skill_level' })
  skill_level: number;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true, name: 'location' })
  location: string;

  @Column({ type: 'text', array: true, nullable: true, name: 'sport_preferences' })
  sport_preferences: string[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}