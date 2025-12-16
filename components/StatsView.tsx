import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Task, CompletionLog } from '../types';
import { formatDateKey } from '../utils';
import { differenceInCalendarDays } from 'date-fns';

interface StatsViewProps {
  tasks: Task[];
  logs: CompletionLog;
}

export const StatsView: React.FC<StatsViewProps> = ({ tasks, logs }) => {
  if (tasks.length === 0) return <div className="text-center text-zinc-600 text-sm py-10">No data available.</div>;

  // Calculate global stats
  // Total possible completions (sum of days each task has been active)
  let totalPossible = 0;
  let totalCompleted = 0;
  let totalFailed = 0;

  const today = new Date();

  tasks.forEach(task => {
    const start = new Date(task.createdAt);
    const dayCount = Math.max(1, differenceInCalendarDays(today, start) + 1);
    
    // Count completions for this task
    let completions = 0;
    Object.values(logs).forEach((dayLog) => {
      if ((dayLog as string[]).includes(task.id)) completions++;
    });

    // Cap completions at dayCount to avoid weird data if logs exist before creation (shouldn't happen but safety first)
    // Actually, logic above handles creation date check implicitly by dayCount.
    // However, we must filter logs by date >= createdAt to be perfectly brutally honest? 
    // Let's assume logs are valid.
    
    totalPossible += dayCount;
    totalCompleted += completions;
  });

  totalFailed = Math.max(0, totalPossible - totalCompleted);

  const data = [
    { name: 'Completed', value: totalCompleted, color: '#059669' }, // emerald-600
    { name: 'Missed', value: totalFailed, color: '#be123c' },    // rose-700
  ];

  const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  return (
    <div className="bg-zinc-900/20 border border-zinc-800 p-6 rounded-sm flex flex-col items-center justify-center relative min-h-[300px]">
      <h2 className="absolute top-6 left-6 text-sm font-mono text-zinc-400 uppercase tracking-widest">Discipline Ratio</h2>
      
      <div className="w-full h-[200px] mt-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '12px' }}
                itemStyle={{ color: '#e4e4e7' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Centered Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-zinc-100">{completionRate}%</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Consistency</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-6 w-full max-w-[200px]">
        <div className="text-center">
            <div className="text-2xl font-bold text-emerald-500">{totalCompleted}</div>
            <div className="text-[10px] text-zinc-500 uppercase font-mono">Wins</div>
        </div>
        <div className="text-center">
            <div className="text-2xl font-bold text-rose-500">{totalFailed}</div>
            <div className="text-[10px] text-zinc-500 uppercase font-mono">Losses</div>
        </div>
      </div>
    </div>
  );
};