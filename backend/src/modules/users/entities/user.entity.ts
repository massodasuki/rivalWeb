import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

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

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'location' })
  location: string;

  @Column({ type: 'text', array: true, nullable: true, name: 'sport_preferences' })
  sport_preferences: string[];

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, name: 'primary_sport' })
  primary_sport: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}