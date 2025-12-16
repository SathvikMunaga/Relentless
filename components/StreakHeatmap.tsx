import React, { useMemo } from 'react';
import { format, eachDayOfInterval, subDays } from 'date-fns';
import { Task, CompletionLog } from '../types';
import { formatDateKey } from '../utils';

interface StreakHeatmapProps {
  tasks: Task[];
  logs: CompletionLog;
}

export const StreakHeatmap: React.FC<StreakHeatmapProps> = ({ tasks, logs }) => {
  const today = new Date();
  const startDate = subDays(today, 364); // Last 365 days

  const dates = useMemo(() => eachDayOfInterval({ start: startDate, end: today }), []);

  const getIntensity = (date: Date) => {
    const key = formatDateKey(date);
    const dayTasks = logs[key] || [];
    
    // Tasks that existed on this date
    const activeTasks = tasks.filter(t => new Date(t.createdAt) <= date && !t.archived);
    
    if (activeTasks.length === 0) return 0;
    
    // Count how many of those active tasks were done
    const completedCount = activeTasks.filter(t => dayTasks.includes(t.id)).length;
    
    if (completedCount === 0) return 0;
    
    const ratio = completedCount / activeTasks.length;
    
    if (ratio === 1) return 4;
    if (ratio >= 0.75) return 3;
    if (ratio >= 0.5) return 2;
    return 1;
  };

  const getColor = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-zinc-900 border-zinc-800'; 
      case 1: return 'bg-emerald-950 border-emerald-900';
      case 2: return 'bg-emerald-900 border-emerald-800';
      case 3: return 'bg-emerald-600 border-emerald-500';
      case 4: return 'bg-emerald-400 border-emerald-300 shadow-[0_0_4px_rgba(52,211,153,0.5)]';
      default: return 'bg-zinc-900 border-zinc-800';
    }
  };

  // Calculate padding for the first week to align rows correctly (Sun-Sat)
  const startDayOfWeek = startDate.getDay(); // 0 (Sun) - 6 (Sat)
  const emptyDays = new Array(startDayOfWeek).fill(null);

  return (
    <div className="w-full overflow-x-auto pb-4">
       <div className="min-w-max">
         <div className="flex gap-1">
            <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
                {emptyDays.map((_, i) => <div key={`empty-${i}`} className="w-3 h-3" />)}
                {dates.map(date => {
                    const intensity = getIntensity(date);
                    return (
                        <div 
                            key={date.toISOString()}
                            className={`w-3 h-3 rounded-[1px] border ${getColor(intensity)} transition-all duration-300 hover:opacity-80`}
                            title={`${format(date, 'MMM d, yyyy')}`}
                        />
                    );
                })}
            </div>
         </div>
         <div className="mt-3 text-[10px] text-zinc-500 font-mono flex justify-end items-center gap-2">
            <span>LESS</span>
            <div className="w-2 h-2 bg-zinc-900 border border-zinc-800 rounded-[1px]"></div>
            <div className="w-2 h-2 bg-emerald-950 border border-emerald-900 rounded-[1px]"></div>
            <div className="w-2 h-2 bg-emerald-900 border border-emerald-800 rounded-[1px]"></div>
            <div className="w-2 h-2 bg-emerald-600 border border-emerald-500 rounded-[1px]"></div>
            <div className="w-2 h-2 bg-emerald-400 border border-emerald-300 rounded-[1px]"></div>
            <span>MORE</span>
         </div>
       </div>
    </div>
  );
};