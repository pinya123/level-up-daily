import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Task } from './task.entity';
import { Competition } from './competition.entity';
import { CompetitionParticipant } from './competition-participant.entity';
import { Friendship } from './friendship.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'time', default: '09:00:00' })
  dayStartTime: string; // User's preferred day start time for points calculation

  @Column({ default: 0 })
  totalPoints: number;

  @Column({ default: 0 })
  currentStreak: number;

  @Column({ default: 0 })
  maxStreak: number;

  @Column({ type: 'date', nullable: true })
  lastTaskDate: Date; // Last date when user completed a task

  @Column({ type: 'jsonb', default: [] })
  pointsHistory: number[]; // Last 7 days of points for trend calculation

  @Column({ type: 'jsonb', default: [] })
  streakHistory: number[]; // History of streak lengths

  @Column({ default: UserRole.USER })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  @OneToMany(() => Competition, (competition) => competition.createdBy)
  competitions: Competition[];

  @OneToMany(() => CompetitionParticipant, (participant) => participant.user)
  competitionParticipations: CompetitionParticipant[];

  @OneToMany(() => Friendship, (friendship) => friendship.user)
  friendships: Friendship[];

  @OneToMany(() => Friendship, (friendship) => friendship.friend)
  friendOf: Friendship[];
} 