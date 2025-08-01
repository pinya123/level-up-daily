import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { CompetitionParticipant } from './competition-participant.entity';

export enum CompetitionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('competitions')
export class Competition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CompetitionStatus,
    default: CompetitionStatus.ACTIVE,
  })
  status: CompetitionStatus;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ default: 5 })
  maxParticipants: number;

  @Column({ type: 'jsonb', default: {} })
  leaderboard: Record<string, number>; // userId -> points mapping

  @Column({ type: 'timestamp', nullable: true })
  lastLeaderboardUpdate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.competitions)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'uuid' })
  createdById: string;

  @OneToMany(() => CompetitionParticipant, (participant) => participant.competition)
  participantDetails: CompetitionParticipant[];

  // Helper methods
  isActive(): boolean {
    const now = new Date();
    return (
      this.status === CompetitionStatus.ACTIVE &&
      now >= this.startDate &&
      now <= this.endDate
    );
  }

  canJoin(): boolean {
    return (
      this.status === CompetitionStatus.ACTIVE &&
      this.participantDetails.length < this.maxParticipants
    );
  }

  getWinner(): string | null {
    if (this.status !== CompetitionStatus.COMPLETED) {
      return null;
    }

    const entries = Object.entries(this.leaderboard);
    if (entries.length === 0) return null;

    return entries.reduce((max, current) =>
      current[1] > max[1] ? current : max
    )[0];
  }
} 