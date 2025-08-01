import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('task_difficulty_reviews')
export class TaskDifficultyReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @Column({ type: 'text' })
  suggestedDifficulty: string; // The difficulty level suggested by reviewer

  @Column({ type: 'text', nullable: true })
  reason: string; // Optional reason for the suggestion

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column({ type: 'uuid' })
  reviewerId: string;

  @ManyToOne(() => Task, (task) => task.difficultyReviews)
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @Column({ type: 'uuid' })
  taskId: string;
} 