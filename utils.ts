import { format, isSameDay, differenceInCalendarDays, endOfMonth, eachDayOfInterval, subDays, parseISO, startOfMonth } from 'date-fns';
import { Task, CompletionLog, TaskStats } from './types';

export const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

export const getTodayKey = (): string => formatDateKey(new Date());

export const calculateTaskStats = (task: Task, logs: CompletionLog, todayKey: string): TaskStats => {
  const dates = Object.keys(logs).sort(); // chronological
  let currentStreak = 0;
  let longestStreak = 0;
  let totalCompletions = 0;
  
  // 1. Calculate total completions
  dates.forEach(date => {
    if (logs[date]?.includes(task.id)) {
      totalCompletions++;
    }
  });

  // 2. Calculate Longest Streak & Current Streak
  const start = task.createdAt; 
  const end = new Date();
  const dayCount = differenceInCalendarDays(end, new Date(start)) + 1;

  // Convert logs to a Set of strings for O(1) lookup.
  const doneDates = new Set<string>();
  for(const d in logs) {
    if (logs[d].includes(task.id)) doneDates.add(d);
  }
  
  // Current Streak Calculation
  const todayDone = doneDates.has(todayKey);
  const yesterday = subDays(new Date(), 1);
  const yesterdayKey = formatDateKey(yesterday);
  const yesterdayDone = doneDates.has(yesterdayKey);
  
  if (!todayDone && !yesterdayDone) {
    currentStreak = 0;
  } else {
    // Count backwards from yesterday
    let d = yesterday;
    let s = 0;
    while (doneDates.has(formatDateKey(d))) {
      s++;
      d = subDays(d, 1);
    }
    currentStreak = s + (todayDone ? 1 : 0);
  }

  // Longest Streak Calculation
  const sortedDates = Array.from(doneDates).sort();
  let maxS = 0;
  let currS = 0;
  let prevDate: Date | null = null;
  
  for (const dateStr of sortedDates) {
    const d = parseISO(dateStr);
    if (!prevDate) {
      currS = 1;
    } else {
      const diff = differenceInCalendarDays(d, prevDate);
      if (diff === 1) {
        currS++;
      } else {
        currS = 1;
      }
    }
    if (currS > maxS) maxS = currS;
    prevDate = d;
  }
  longestStreak = maxS;
  
  // Completion Rate
  const rate = dayCount > 0 ? Math.round((totalCompletions / dayCount) * 100) : 0;

  // Last Completed
  let lastCompleted = null;
  if (sortedDates.length > 0) {
    lastCompleted = sortedDates[sortedDates.length - 1];
  }

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    completionRate: rate,
    lastCompletedDate: lastCompleted
  };
};

export const getMonthDays = (date: Date): Date[] => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};