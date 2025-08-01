import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Task, TaskStatus, TaskDifficulty, RecurrenceType } from '../entities/task.entity';
import { User } from '../entities/user.entity';

export class CreateTaskDto {
  title: string;
  description?: string;
  difficulty: TaskDifficulty;
  recurrenceType?: RecurrenceType;
  recurrenceConfig?: any;
  dueDate?: Date;
}

export class UpdateTaskDto {
  title?: string;
  description?: string;
  difficulty?: TaskDifficulty;
  dueDate?: Date;
}

export class CompleteTaskDto {
  reflectionNote: string;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createTask(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      userId,
      taskDate: new Date(),
    });

    // Handle recurring tasks
    if (createTaskDto.recurrenceType && createTaskDto.recurrenceType !== RecurrenceType.NONE) {
      task.recurrenceConfig = createTaskDto.recurrenceConfig || {};
    }

    return this.taskRepository.save(task);
  }

  async getUserTasks(userId: string, status?: TaskStatus): Promise<Task[]> {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return this.taskRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async getTaskById(userId: string, taskId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async updateTask(userId: string, taskId: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.getTaskById(userId, taskId);

    if (task.status === TaskStatus.COMPLETED) {
      throw new BadRequestException('Cannot edit completed tasks');
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    const task = await this.getTaskById(userId, taskId);
    
    // If task is completed, we need to adjust user's points
    if (task.status === TaskStatus.COMPLETED) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        user.totalPoints -= task.pointsEarned;
        await this.userRepository.save(user);
      }
    }

    task.status = TaskStatus.DELETED;
    await this.taskRepository.save(task);
  }

  async completeTask(userId: string, taskId: string, completeTaskDto: CompleteTaskDto): Promise<Task> {
    const task = await this.getTaskById(userId, taskId);

    if (task.status === TaskStatus.COMPLETED) {
      throw new BadRequestException('Task is already completed');
    }

    if (!completeTaskDto.reflectionNote?.trim()) {
      throw new BadRequestException('Reflection note is required');
    }

    // Calculate points based on difficulty and completion time
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    task.status = TaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.reflectionNote = completeTaskDto.reflectionNote;
    task.pointsEarned = task.calculatePoints(user.dayStartTime);
    task.pointsCalculatedAt = new Date();

    const savedTask = await this.taskRepository.save(task);

    // Update user stats
    await this.updateUserStats(user, savedTask);

    return savedTask;
  }

  private async updateUserStats(user: User, completedTask: Task): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update total points
    user.totalPoints += completedTask.pointsEarned;

    // Update points history (keep last 7 days)
    user.pointsHistory = user.pointsHistory || [];
    user.pointsHistory.push(completedTask.pointsEarned);
    if (user.pointsHistory.length > 7) {
      user.pointsHistory = user.pointsHistory.slice(-7);
    }

    // Update streak
    if (!user.lastTaskDate || this.isConsecutiveDay(user.lastTaskDate, today)) {
      user.currentStreak += 1;
      if (user.currentStreak > user.maxStreak) {
        user.maxStreak = user.currentStreak;
      }
    } else {
      // Reset streak if not consecutive
      user.currentStreak = 1;
    }

    user.lastTaskDate = today;

    await this.userRepository.save(user);
  }

  private isConsecutiveDay(lastDate: Date, currentDate: Date): boolean {
    const last = new Date(lastDate);
    const current = new Date(currentDate);
    const diffTime = Math.abs(current.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  async getDailyStats(userId: string, date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await this.taskRepository.find({
      where: {
        userId,
        taskDate: Between(startOfDay, endOfDay),
        status: TaskStatus.COMPLETED,
      },
    });

    const totalPoints = tasks.reduce((sum, task) => sum + task.pointsEarned, 0);
    const tasksCompleted = tasks.length;

    return {
      date: date.toISOString().split('T')[0],
      totalPoints,
      tasksCompleted,
      tasks,
    };
  }

  async getWeeklyStats(userId: string): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);

    const tasks = await this.taskRepository.find({
      where: {
        userId,
        taskDate: Between(startDate, endDate),
        status: TaskStatus.COMPLETED,
      },
      order: { taskDate: 'ASC' },
    });

    const dailyStats: Array<{
      date: string;
      points: number;
      tasksCompleted: number;
    }> = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayTasks = tasks.filter(task => 
        task.taskDate.toDateString() === date.toDateString()
      );
      
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        points: dayTasks.reduce((sum, task) => sum + task.pointsEarned, 0),
        tasksCompleted: dayTasks.length,
      });
    }

    return dailyStats;
  }
} 