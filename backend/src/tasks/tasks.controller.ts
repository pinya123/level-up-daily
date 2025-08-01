import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TasksService, CreateTaskDto, UpdateTaskDto, CompleteTaskDto } from './tasks.service';
import { TaskStatus } from '../entities/task.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  async createTask(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.createTask(req.user.id, createTaskDto);
  }

  @Get()
  async getUserTasks(@Request() req, @Query('status') status?: string) {
    return this.tasksService.getUserTasks(req.user.id, status as TaskStatus);
  }

  @Get(':id')
  async getTaskById(@Request() req, @Param('id') taskId: string) {
    return this.tasksService.getTaskById(req.user.id, taskId);
  }

  @Put(':id')
  async updateTask(
    @Request() req,
    @Param('id') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(req.user.id, taskId, updateTaskDto);
  }

  @Delete(':id')
  async deleteTask(@Request() req, @Param('id') taskId: string) {
    return this.tasksService.deleteTask(req.user.id, taskId);
  }

  @Post(':id/complete')
  async completeTask(
    @Request() req,
    @Param('id') taskId: string,
    @Body() completeTaskDto: CompleteTaskDto,
  ) {
    return this.tasksService.completeTask(req.user.id, taskId, completeTaskDto);
  }

  @Get('stats/daily')
  async getDailyStats(@Request() req, @Query('date') date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    return this.tasksService.getDailyStats(req.user.id, targetDate);
  }

  @Get('stats/weekly')
  async getWeeklyStats(@Request() req) {
    return this.tasksService.getWeeklyStats(req.user.id);
  }
} 