import React from 'react';
import { Task, TaskStats } from '../types';
import { Check, Flame, Trophy, AlertCircle } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  stats: TaskStats;
  isCompletedToday: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  stats, 
  isCompletedToday, 
  onToggle, 
  onDelete 
}) => {
  return (
    <div className={`
      group relative flex items-center justify-between p-4 mb-3 
      border transition-all duration-300
      ${isCompletedToday 
        ? 'border-emerald-900/30 bg-emerald-950/5' 
        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
      }
    `}>
      {/* Left: Checkbox & Title */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onToggle}
          className={`
            relative flex items-center justify-center w-6 h-6 border-2 transition-all duration-200
            ${isCompletedToday 
              ? 'border-emerald-500 bg-emerald-500 text-zinc-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
              : 'border-zinc-600 hover:border-zinc-400 bg-transparent'
            }
          `}
          aria-label={isCompletedToday ? "Mark as not done" : "Mark as done"}
        >
          {isCompletedToday && <Check size={14} strokeWidth={4} />}
        </button>
        
        <div className="flex flex-col">
          <span className={`
            font-medium text-sm transition-colors duration-300
            ${isCompletedToday ? 'text-emerald-400' : 'text-zinc-200'}
          `}>
            {task.title}
          </span>
          {/* Mobile Streak Stats */}
          <div className="flex md:hidden gap-3 mt-1 text-xs text-zinc-500 font-mono">
            <span className={stats.currentStreak > 0 ? "text-emerald-500" : ""}>
               {stats.currentStreak}d streak
            </span>
          </div>
        </div>
      </div>

      {/* Right: Desktop Stats & Actions */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6 text-xs font-mono text-zinc-500">
          
          <div className="flex items-center gap-1.5 min-w-[80px]" title="Current Streak">
            <Flame 
              size={14} 
              className={stats.currentStreak > 0 ? "text-emerald-500" : "text-zinc-700"} 
            />
            <span className={stats.currentStreak > 0 ? "text-emerald-500" : ""}>
              {stats.currentStreak} <span className="text-[10px] opacity-60">CURR</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 min-w-[80px]" title="Longest Streak">
            <Trophy size={14} className="text-zinc-700" />
            <span>
              {stats.longestStreak} <span className="text-[10px] opacity-60">BEST</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 min-w-[60px]" title="Success Rate">
            <span className={stats.completionRate < 50 ? "text-rose-500" : "text-zinc-400"}>
              {stats.completionRate}%
            </span>
          </div>
        </div>

        <button 
          onClick={(e) => {
            if(confirm('Delete this task? History will be preserved but hidden.')) onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-rose-500 p-1"
          title="Delete Task"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>

      {/* Warning if missed yesterday and streak was > 0 */}
      {!isCompletedToday && stats.currentStreak === 0 && stats.lastCompletedDate && stats.totalCompletions > 0 && (
         <div className="absolute right-2 top-2 text-rose-600 opacity-20 pointer-events-none">
            <AlertCircle size={12} />
         </div>
      )}
    </div>
  );
};
