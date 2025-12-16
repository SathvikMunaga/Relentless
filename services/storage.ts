import { Task, CompletionLog } from '../types';

const TASKS_KEY = 'relentless_tasks';
const LOGS_KEY = 'relentless_logs';

export const getTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load tasks", e);
    return [];
  }
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const getLogs = (): CompletionLog => {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to load logs", e);
    return {};
  }
};

export const saveLogs = (logs: CompletionLog) => {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};

export const toggleTaskCompletion = (taskId: string, dateKey: string): CompletionLog => {
  const logs = getLogs();
  const dayLog = logs[dateKey] || [];
  
  if (dayLog.includes(taskId)) {
    logs[dateKey] = dayLog.filter(id => id !== taskId);
  } else {
    logs[dateKey] = [...dayLog, taskId];
  }
  
  // Cleanup empty days to save space
  if (logs[dateKey].length === 0) {
    delete logs[dateKey];
  }
  
  saveLogs(logs);
  return logs;
};
