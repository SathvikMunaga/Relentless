export interface Task {
  id: string;
  title: string;
  createdAt: number; // Timestamp
  archived?: boolean;
}

export interface TaskStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number; // 0-100
  lastCompletedDate: string | null; // YYYY-MM-DD
}

export type CompletionLog = Record<string, string[]>; // { "YYYY-MM-DD": ["taskId1", "taskId2"] }

export interface DayStatus {
  date: string;
  totalTasks: number;
  completedTasks: number;
  status: 'perfect' | 'partial' | 'failed' | 'empty';
}
