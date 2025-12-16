import React, { useState } from 'react';
import { format, isFuture, isSameDay, getDaysInMonth, addMonths } from 'date-fns';
import startOfMonth from 'date-fns/startOfMonth';
import subMonths from 'date-fns/subMonths';
import { CompletionLog, Task } from '../types';
import { ChevronLeft, ChevronRight, X, CheckCircle2 } from 'lucide-react';
import { formatDateKey } from '../utils';

interface CalendarViewProps {
  tasks: Task[];
  logs: CompletionLog;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, logs }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(currentDate);
  const startDay = startOfMonth(currentDate).getDay(); // 0 is Sunday
  
  // Grid generation
  const days = [];
  // Empty padding for start of month
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const getDayStatus = (date: Date) => {
    const key = formatDateKey(date);
    const dayTasks = logs[key] || [];
    
    // Filter tasks that existed on this date
    // For simplicity, we assume all current tasks "should" have been done if they exist now.
    // A more complex app would check creation date. 
    // Let's check creation date for Brutal Honesty: You can't fail a task that didn't exist.
    const activeTasks = tasks.filter(t => new Date(t.createdAt) <= date && !t.archived);
    
    if (activeTasks.length === 0) return 'empty';
    
    const completedCount = activeTasks.filter(t => dayTasks.includes(t.id)).length;
    
    if (completedCount === activeTasks.length) return 'perfect';
    if (completedCount === 0) return 'failed';
    return 'partial';
  };

  const getColor = (status: string, isFutureDate: boolean) => {
    if (isFutureDate) return 'bg-zinc-900 border-zinc-800 opacity-50';
    switch (status) {
      case 'perfect': return 'bg-emerald-600 border-emerald-500 shadow-[0_0_10px_rgba(5,150,105,0.3)]';
      case 'partial': return 'bg-amber-600 border-amber-500';
      case 'failed': return 'bg-rose-900 border-rose-800 opacity-80'; // Dark red for failure
      case 'empty': return 'bg-zinc-800 border-zinc-700';
      default: return 'bg-zinc-800';
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/20 border border-zinc-800 p-6 rounded-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-mono text-zinc-400 uppercase tracking-widest">History</h2>
        <div className="flex items-center gap-2">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:text-white text-zinc-500 transition-colors"><ChevronLeft size={16}/></button>
            <span className="text-sm font-bold w-32 text-center">{format(currentDate, 'MMMM yyyy')}</span>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:text-white text-zinc-500 transition-colors"><ChevronRight size={16}/></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['S','M','T','W','T','F','S'].map(d => (
          <div key={d} className="text-center text-xs text-zinc-600 font-mono">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="aspect-square" />;
          
          const isFutureDate = isFuture(date);
          const status = getDayStatus(date);
          const key = formatDateKey(date);
          const isSelected = selectedDay === key;

          return (
            <button
              key={key}
              disabled={isFutureDate && !isSelected}
              onClick={() => setSelectedDay(isSelected ? null : key)}
              className={`
                aspect-square w-full rounded-sm border transition-all duration-200 relative group
                ${getColor(status, isFutureDate)}
                ${isSelected ? 'ring-2 ring-white z-10 scale-110' : 'hover:opacity-100 opacity-90'}
              `}
            >
               {/* Tooltip for fast check */}
               <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded border border-zinc-700 pointer-events-none whitespace-nowrap z-20">
                  {format(date, 'MMM d')}
               </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Detail View */}
      {selectedDay && (
        <div className="mt-6 border-t border-zinc-800 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-mono text-sm text-zinc-300">
                Log: {format(new Date(selectedDay), 'EEEE, MMM do')}
             </h3>
             <button onClick={() => setSelectedDay(null)} className="text-zinc-500 hover:text-white"><X size={14}/></button>
           </div>
           
           <div className="space-y-2">
             {tasks.filter(t => new Date(t.createdAt) <= new Date(selectedDay)).map(task => {
                const done = logs[selectedDay]?.includes(task.id);
                return (
                  <div key={task.id} className="flex items-center justify-between text-sm p-2 bg-zinc-950/50 rounded border border-zinc-800/50">
                    <span className={done ? "text-zinc-300" : "text-rose-400 line-through decoration-rose-900/50 opacity-60"}>{task.title}</span>
                    {done ? <CheckCircle2 size={14} className="text-emerald-500"/> : <span className="text-[10px] text-rose-500 font-mono uppercase">Missed</span>}
                  </div>
                );
             })}
             {tasks.filter(t => new Date(t.createdAt) <= new Date(selectedDay)).length === 0 && (
                <p className="text-xs text-zinc-600 italic">No active tasks on this day.</p>
             )}
           </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="mt-auto pt-6 flex gap-4 justify-center text-[10px] text-zinc-500 uppercase font-mono tracking-wider">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-600 rounded-full"></div>Done</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-amber-600 rounded-full"></div>Partial</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-rose-900 rounded-full"></div>Fail</div>
      </div>
    </div>
  );
};