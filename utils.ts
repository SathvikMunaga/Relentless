import { format, isSameDay, differenceInCalendarDays, endOfMonth, eachDayOfInterval } from 'date-fns';
import subDays from 'date-fns/subDays';
import parseISO from 'date-fns/parseISO';
import startOfMonth from 'date-fns/startOfMonth';
import { Task, CompletionLog, TaskStats } from './types';

export const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

export const getTodayKey = (): string => formatDateKey(new Date());

export const calculateTaskStats = (task: Task, logs: CompletionLog, todayKey: string): TaskStats => {
  const dates = Object.keys(logs).sort(); // chronological
  let currentStreak = 0;
  let longestStreak = 0;
  let totalCompletions = 0;
  let tempStreak = 0;
  
  // Efficiently traverse dates? 
  // For a brutally honest tracker, we must scan properly.
  // Actually, standard iteration is fast enough for < 10 years of data.
  
  // 1. Calculate total completions
  dates.forEach(date => {
    if (logs[date]?.includes(task.id)) {
      totalCompletions++;
    }
  });

  // 2. Calculate Longest Streak
  // We need to iterate day by day from creation to today? 
  // Or just iterate the logs? 
  // Simplest: Iterate from first log date to today.
  
  const start = task.createdAt; 
  const end = new Date();
  const dayCount = differenceInCalendarDays(end, new Date(start)) + 1;
  const daysSinceCreation = Math.max(1, dayCount);

  let streak = 0;
  // We scan sorted dates in the log to find streaks.
  // However, gaps in logs mean broken streaks.
  
  // A robust way for local calculation without iterating 1000s of days:
  // Convert logs to a Set of strings for O(1) lookup.
  const doneDates = new Set<string>();
  for(const d in logs) {
    if (logs[d].includes(task.id)) doneDates.add(d);
  }
  
  // Determine "Best Streak"
  // This can be computationally heavy if done daily on render. 
  // Optimization: Only re-calc if needed. But for this MVP, we iterate.
  // To avoid iterating 1000 days, we only iterate the "doneDates" logic if we assume consecutive.
  // But users might have gaps.
  
  // Let's implement a "check backwards from today" for Current Streak
  let ptr = new Date();
  let seeking = true;
  
  // Check today
  if (doneDates.has(formatDateKey(ptr))) {
    currentStreak++;
  } else {
    // If not done today, checking yesterday
    // But wait, if today is NOT done, streak is preserved UNTIL the day ends?
    // Prompt: "Missing a day resets the streak immediately."
    // This implies if I haven't done it today, my streak is technically "at risk" but visual representation usually includes yesterday's completed streak until today is missed.
    // HOWEVER, standard streak logic: Streak is alive if LastDone == Yesterday || LastDone == Today.
  }
  
  // Let's correct the "Current Streak" logic:
  // If done today: Streak = 1 + streak(yesterday)
  // If not done today: Streak = streak(yesterday)
  // If not done yesterday: Streak = 0.
  
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

  // To find Longest Streak, we iterate active ranges in `doneDates`.
  // Sort dates.
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