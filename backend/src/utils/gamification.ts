import { PrismaClient, Prisma } from '@prisma/client';

// Calculate points based on completion time
export const calculatePoints = (basePoints: number, dayStart: number, completedAt: Date): number => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(dayStart, 0, 0, 0);

  // If completion time is before day start, use previous day
  if (completedAt < startOfDay) {
    startOfDay.setDate(startOfDay.getDate() - 1);
  }

  const hoursSinceStart = Math.max((completedAt.getTime() - startOfDay.getTime()) / (1000 * 60 * 60), 1);
  
  // Formula: Points = (Difficulty Points) / max({hours since user's chosen day start}, 1)
  return Math.round(basePoints / hoursSinceStart);
};

// Update user streak
export const updateStreak = async (prisma: any, userId: string, completedAt: Date): Promise<any> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      maxStreak: true,
      lastTaskDate: true,
      dayStart: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const taskDate = new Date(completedAt);
  taskDate.setHours(0, 0, 0, 0);

  const lastTaskDate = user.lastTaskDate ? new Date(user.lastTaskDate) : null;
  const lastTaskDateOnly = lastTaskDate ? new Date(lastTaskDate.setHours(0, 0, 0, 0)) : null;

  let newStreak = user.currentStreak;
  let newMaxStreak = user.maxStreak;

  if (!lastTaskDateOnly) {
    // First task ever
    newStreak = 1;
    newMaxStreak = 1;
  } else {
    const daysDifference = Math.floor((taskDate.getTime() - lastTaskDateOnly.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference === 0) {
      // Same day, streak continues
      newStreak = user.currentStreak;
    } else if (daysDifference === 1) {
      // Consecutive day, increment streak
      newStreak = user.currentStreak + 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }

    // Update max streak if current streak is higher
    if (newStreak > user.maxStreak) {
      newMaxStreak = newStreak;
    }
  }

  return await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      maxStreak: newMaxStreak,
      lastTaskDate: completedAt
    },
    select: {
      id: true,
      username: true,
      currentStreak: true,
      maxStreak: true,
      lastTaskDate: true
    }
  });
};

// Generate productivity suggestions
export const generateSuggestions = async (prisma: PrismaClient, userId: string): Promise<string[]> => {
  const suggestions: string[] = [];

  // Get user's recent task completion patterns
  const recentTasks = await prisma.task.findMany({
    where: {
      userId,
      completedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    },
    orderBy: { completedAt: 'desc' }
  });

  if (recentTasks.length === 0) {
    suggestions.push("Start with small, easy tasks to build momentum!");
    suggestions.push("Set your day start time to when you're most productive.");
    return suggestions;
  }

  // Analyze completion times
  const completionHours = recentTasks.map(task => task.completedAt!.getHours());
  const earlyCompletions = completionHours.filter(hour => hour < 12).length;
  const lateCompletions = completionHours.filter(hour => hour >= 18).length;

  if (earlyCompletions > lateCompletions) {
    suggestions.push("Great job completing tasks early! Keep this momentum going.");
  } else if (lateCompletions > earlyCompletions) {
    suggestions.push("Try completing tasks earlier in the day for bonus points!");
  }

  // Analyze difficulty patterns
  const difficultyCounts = recentTasks.reduce((acc, task) => {
    acc[task.difficulty] = (acc[task.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalTasks = recentTasks.length;
  const easyPercentage = (difficultyCounts.EASY || 0) / totalTasks;
  const hardPercentage = (difficultyCounts.HARD || 0) / totalTasks;

  if (easyPercentage > 0.7) {
    suggestions.push("Challenge yourself with more medium-difficulty tasks!");
  } else if (hardPercentage > 0.5) {
    suggestions.push("Great work tackling challenging tasks! Don't forget to balance with easier ones.");
  }

  // Streak-based suggestions
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, maxStreak: true }
  });

  if (user) {
    if (user.currentStreak === 0) {
      suggestions.push("Start a new streak today! Every task counts.");
    } else if (user.currentStreak >= 3) {
      suggestions.push(`Amazing ${user.currentStreak}-day streak! Keep it going!`);
    }

    if (user.currentStreak === user.maxStreak && user.maxStreak > 0) {
      suggestions.push("You're at your personal best streak! Push for a new record!");
    }
  }

  // Default suggestions if none generated
  if (suggestions.length === 0) {
    suggestions.push("Mix easy and challenging tasks for optimal productivity.");
    suggestions.push("Complete tasks early in your day for maximum points!");
  }

  return suggestions;
};

// Calculate competition leaderboard
export const calculateLeaderboard = async (prisma: PrismaClient, competitionId: string) => {
  const members = await prisma.competitionMember.findMany({
    where: { competitionId },
    include: {
      user: {
        select: {
          id: true,
          username: true
        }
      },
      competition: {
        select: {
          startDate: true,
          endDate: true
        }
      }
    }
  });

  // Calculate points for each member based on completed tasks in competition
  const leaderboard = await Promise.all(
    members.map(async (member) => {
      const tasks = await prisma.task.findMany({
        where: {
          userId: member.userId,
          competitionId,
          completedAt: {
            gte: member.competition.startDate,
            lte: member.competition.endDate
          }
        }
      });

      const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
      const tasksCompleted = tasks.length;

      return {
        userId: member.userId,
        username: member.user.username,
        totalPoints,
        tasksCompleted,
        rank: 0 // Will be calculated below
      };
    })
  );

  // Sort by points and assign ranks
  leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return leaderboard;
}; 