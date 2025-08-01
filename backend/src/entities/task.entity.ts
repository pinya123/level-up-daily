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
import { TaskDifficultyReview } from './task-difficulty-review.entity';

export enum TaskDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  DIFFICULT = 'difficult',
}

export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  DELETED = 'deleted',
}

export enum RecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskDifficulty,
    default: TaskDifficulty.MEDIUM,
  })
  difficulty: TaskDifficulty;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: RecurrenceType,
    default: RecurrenceType.NONE,
  })
  recurrenceType: RecurrenceType;

  @Column({ type: 'jsonb', nullable: true })
  recurrenceConfig: any; // For storing recurrence rules

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  reflectionNote: string; // Mandatory reflection note on completion

  @Column({ default: 0 })
  pointsEarned: number;

  @Column({ type: 'timestamp', nullable: true })
  pointsCalculatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  parentTaskId: string; // For recurring tasks, links to original task

  @Column({ type: 'date' })
  taskDate: Date; // The date this task instance belongs to

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToMany(() => TaskDifficultyReview, (review) => review.task)
  difficultyReviews: TaskDifficultyReview[];

  // Helper methods
  getDifficultyPoints(): number {
    switch (this.difficulty) {
      case TaskDifficulty.EASY:
        return 50;
      case TaskDifficulty.MEDIUM:
        return 70;
      case TaskDifficulty.DIFFICULT:
        return 100;
      default:
        return 70;
    }
  }

  calculatePoints(userDayStartTime: string): number {
    if (this.status !== TaskStatus.COMPLETED || !this.completedAt) {
      return 0;
    }

    const difficultyPoints = this.getDifficultyPoints();
    const completionTime = new Date(this.completedAt);
    const dayStart = new Date(completionTime);
    const [hours, minutes] = userDayStartTime.split(':').map(Number);
    dayStart.setHours(hours, minutes, 0, 0);

    const hoursSinceDayStart = Math.max(
      (completionTime.getTime() - dayStart.getTime()) / (1000 * 60 * 60),
      1
    );

    return Math.round(difficultyPoints / hoursSinceDayStart);
  }
} 