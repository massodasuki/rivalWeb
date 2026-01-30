import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Friendship } from '../../friendships/entities/friendship.entity';
import { Team } from '../../teams/entities/team.entity';
import { TeamMember } from '../../teams/entities/team-member.entity';
import { MatchParticipant } from '../../matches/entities/match-participant.entity';
import { MatchStat } from '../../matches/entities/match-stat.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { ChatMessage } from '../../chat/entities/chat-message.entity';
import { CommunityPost } from '../../community/entities/community-post.entity';
import { Achievement } from '../../achievements/entities/achievement.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255 })
  password_hash: string;

  @Column({ nullable: true })
  skill_level: number;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true, name: 'location' })
  location: string;

  @Column({ type: 'text', array: true, nullable: true })
  sport_preferences: string[];

  @CreateDateColumn()
  created_at: Date;

  // Relationships
  @OneToMany(() => Friendship, friendship => friendship.user)
  friendships: Friendship[];

  @OneToMany(() => Friendship, friendship => friendship.friend)
  friendRequests: Friendship[];

  @OneToMany(() => Team, team => team.captain)
  captainedTeams: Team[];

  @OneToMany(() => TeamMember, teamMember => teamMember.user)
  teamMemberships: TeamMember[];

  @OneToMany(() => MatchParticipant, participant => participant.user)
  matchParticipations: MatchParticipant[];

  @OneToMany(() => MatchStat, stat => stat.user)
  matchStats: MatchStat[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @OneToMany(() => ChatMessage, message => message.sender)
  sentMessages: ChatMessage[];

  @OneToMany(() => CommunityPost, post => post.user)
  communityPosts: CommunityPost[];

  @OneToMany(() => Achievement, achievement => achievement.user)
  achievements: Achievement[];
}