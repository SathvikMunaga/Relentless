import { Task, CompletionLog } from '../types';
import { v4 as uuidv4 } from 'uuid';

const TASKS_KEY_BASE = 'relentless_tasks';
const LOGS_KEY_BASE = 'relentless_logs';
const DEVICE_ID_KEY = 'relentless_device_identity';

// Identity Management
export const getDeviceId = (): string => {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

// Storage Helpers
const getTasksKey = (id: string) => `${TASKS_KEY_BASE}_${id}`;
const getLogsKey = (id: string) => `${LOGS_KEY_BASE}_${id}`;

export const getTasks = (id: string): Task[] => {
  try {
    const raw = localStorage.getItem(getTasksKey(id));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load tasks", e);
    return [];
  }
};

export const saveTasks = (id: string, tasks: Task[]) => {
  localStorage.setItem(getTasksKey(id), JSON.stringify(tasks));
};

export const getLogs = (id: string): CompletionLog => {
  try {
    const raw = localStorage.getItem(getLogsKey(id));
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to load logs", e);
    return {};
  }
};

export const saveLogs = (id: string, logs: CompletionLog) => {
  localStorage.setItem(getLogsKey(id), JSON.stringify(logs));
};

export const toggleTaskCompletion = (id: string, taskId: string, dateKey: string): CompletionLog => {
  const logs = getLogs(id);
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
  
  saveLogs(id, logs);
  return logs;
};

// Backup & Restore
export const exportData = (id: string) => {
    const tasks = getTasks(id);
    const logs = getLogs(id);
    return JSON.stringify({
        version: 1,
        deviceId: id,
        timestamp: Date.now(),
        tasks,
        logs
    }, null, 2);
};

export const importData = (jsonStr: string): boolean => {
    try {
        const data = JSON.parse(jsonStr);
        if (!data.tasks || !data.logs) return false;
        
        // We use the imported data but KEEP the current device ID for this session,
        // unless we want to fully clone the other device's identity.
        // Rule: "Identity is tied to the browser". 
        // Strategy: Import data INTO current device ID.
        
        const currentId = getDeviceId();
        saveTasks(currentId, data.tasks);
        saveLogs(currentId, data.logs);
        return true;
    } catch (e) {
        console.error("Import failed", e);
        return false;
    }
};

export const clearData = (id: string) => {
    localStorage.removeItem(getTasksKey(id));
    localStorage.removeItem(getLogsKey(id));
};
