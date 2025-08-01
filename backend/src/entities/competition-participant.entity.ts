import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Competition } from './competition.entity';

@Entity('competition_participants')
export class CompetitionParticipant {
  @PrimaryColumn({ type: 'uuid' })
  competitionId: string;

  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  @Column({ default: 0 })
  pointsEarned: number;

  @Column({ default: 0 })
  tasksCompleted: number;

  @Column({ type: 'date', nullable: true })
  lastActivityDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.competitions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Competition, (competition) => competition.participantDetails)
  @JoinColumn({ name: 'competitionId' })
  competition: Competition;
} 