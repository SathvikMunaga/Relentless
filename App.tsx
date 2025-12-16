import React, { useState, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, CompletionLog } from './types';
import { getDeviceId, getTasks, saveTasks, getLogs, saveLogs, toggleTaskCompletion, exportData, importData } from './services/storage';
import { calculateTaskStats, getTodayKey } from './utils';
import { TaskItem } from './components/TaskItem';
import { CalendarView } from './components/CalendarView';
import { StatsView } from './components/StatsView';
import { StreakHeatmap } from './components/StreakHeatmap';
import { Button } from './components/Button';
import { Plus, LayoutDashboard, Calendar as CalIcon, BarChart2, HardDrive, Download, Upload, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  // Core State
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<CompletionLog>({});
  
  // UI State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar' | 'stats' | 'data'>('tasks');
  const [isAdding, setIsAdding] = useState(false);
  
  // File Import Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Initialize Identity on Mount
  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    setTasks(getTasks(id));
    setLogs(getLogs(id));
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !deviceId) return;

    const newTask: Task = {
      id: uuidv4(),
      title: newTaskTitle.trim(),
      createdAt: Date.now(),
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(deviceId, updatedTasks);
    setNewTaskTitle('');
    setIsAdding(false);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!deviceId) return;
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(deviceId, updatedTasks);
  };

  const handleToggle = (taskId: string) => {
    if (!deviceId) return;
    const today = getTodayKey();
    const newLogs = toggleTaskCompletion(deviceId, taskId, today);
    setLogs({...newLogs}); 
  };

  const handleExport = () => {
    if (!deviceId) return;
    const json = exportData(deviceId);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relentless-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !deviceId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (importData(content)) {
        // Reload state
        setTasks(getTasks(deviceId));
        setLogs(getLogs(deviceId));
        alert('Data imported successfully.');
        setActiveTab('tasks');
      } else {
        alert('Failed to import data. Invalid file format.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Compute derived state
  const todayKey = getTodayKey();
  const taskStats = useMemo(() => {
    return tasks.map(t => ({
      task: t,
      stats: calculateTaskStats(t, logs, todayKey)
    }));
  }, [tasks, logs, todayKey]);

  const sortedTaskStats = [...taskStats].sort((a, b) => {
    const aDone = logs[todayKey]?.includes(a.task.id);
    const bDone = logs[todayKey]?.includes(b.task.id);
    if (aDone === bDone) return 0;
    return aDone ? 1 : -1;
  });

  if (!deviceId) return null; // Or a minimal loader

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col md:flex-row font-sans selection:bg-emerald-900 selection:text-white">
      
      {/* Mobile Header/Nav */}
      <div className="md:hidden sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tighter text-white">RELENTLESS.</h1>
        <div className="flex gap-2">
            <button onClick={() => setActiveTab('tasks')} className={`p-2 rounded ${activeTab === 'tasks' ? 'text-emerald-500 bg-zinc-900' : 'text-zinc-500'}`}><LayoutDashboard size={20}/></button>
            <button onClick={() => setActiveTab('calendar')} className={`p-2 rounded ${activeTab === 'calendar' ? 'text-emerald-500 bg-zinc-900' : 'text-zinc-500'}`}><CalIcon size={20}/></button>
            <button onClick={() => setActiveTab('stats')} className={`p-2 rounded ${activeTab === 'stats' ? 'text-emerald-500 bg-zinc-900' : 'text-zinc-500'}`}><BarChart2 size={20}/></button>
            <button onClick={() => setActiveTab('data')} className={`p-2 rounded ${activeTab === 'data' ? 'text-emerald-500 bg-zinc-900' : 'text-zinc-500'}`}><HardDrive size={20}/></button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800 p-6 sticky top-0 h-screen">
        <h1 className="text-2xl font-black tracking-tighter text-white mb-10">RELENTLESS.</h1>
        <nav className="flex flex-col gap-2">
            <Button variant="ghost" className="justify-start text-left" onClick={() => setActiveTab('tasks')}>
               <span className={activeTab === 'tasks' ? "text-emerald-400" : ""}>Dashboard</span>
            </Button>
            <Button variant="ghost" className="justify-start text-left" onClick={() => setActiveTab('calendar')}>
               <span className={activeTab === 'calendar' ? "text-emerald-400" : ""}>History Log</span>
            </Button>
            <Button variant="ghost" className="justify-start text-left" onClick={() => setActiveTab('stats')}>
               <span className={activeTab === 'stats' ? "text-emerald-400" : ""}>Analytics</span>
            </Button>
            <Button variant="ghost" className="justify-start text-left" onClick={() => setActiveTab('data')}>
               <span className={activeTab === 'data' ? "text-emerald-400" : ""}>Data & Storage</span>
            </Button>
        </nav>
        
        <div className="mt-auto pt-6 border-t border-zinc-900">
           <div className="text-[10px] text-zinc-600 font-mono mb-2 flex items-center gap-2">
               <HardDrive size={10} />
               <span>DEVICE ID: {deviceId.slice(0, 8)}...</span>
           </div>
           <div className="text-[10px] text-zinc-700 font-mono">
              DISCIPLINE EQUALS FREEDOM.
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-12">
        
        {/* Header Section (Desktop) */}
        <div className="hidden md:flex justify-between items-end mb-12">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                    {activeTab === 'tasks' ? 'Daily Protocol' : activeTab === 'calendar' ? 'Consistency Log' : activeTab === 'stats' ? 'Performance Analytics' : 'Device Storage'}
                </h2>
                <p className="text-zinc-500 text-sm font-mono">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
            {activeTab === 'tasks' && (
                <Button onClick={() => setIsAdding(!isAdding)} variant="primary" size="sm" className="flex items-center gap-2">
                    <Plus size={16} /> New Protocol
                </Button>
            )}
        </div>

        {/* Dynamic Content */}
        <div className="space-y-6">
            
            {/* Add Task Form (Mobile & Desktop) */}
            {(isAdding || (activeTab === 'tasks' && tasks.length === 0 && activeTab !== 'data')) && (
                <form onSubmit={handleAddTask} className="mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="flex gap-2">
                        <input 
                            autoFocus
                            type="text" 
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="What must be done?"
                            className="flex-1 bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-zinc-600 font-medium"
                        />
                        <Button type="submit" variant="primary">Add</Button>
                        {tasks.length > 0 && <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>}
                    </div>
                </form>
            )}

            {/* Mobile FAB for Add */}
            {activeTab === 'tasks' && !isAdding && tasks.length > 0 && (
                 <button 
                    onClick={() => setIsAdding(true)}
                    className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/50 z-50 hover:scale-105 transition-transform"
                 >
                    <Plus size={24} />
                 </button>
            )}

            {activeTab === 'tasks' && (
                <>
                    {sortedTaskStats.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-lg">
                            <p className="text-zinc-500 mb-4">No active protocols.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {sortedTaskStats.map(({ task, stats }) => (
                                <TaskItem 
                                    key={task.id} 
                                    task={task} 
                                    stats={stats}
                                    isCompletedToday={logs[todayKey]?.includes(task.id) || false}
                                    onToggle={() => handleToggle(task.id)}
                                    onDelete={() => handleDeleteTask(task.id)}
                                />
                            ))}
                        </div>
                    )}
                    
                    {/* Heatmap Section */}
                    <div className="mt-12 pt-8 border-t border-zinc-900">
                        <div className="flex items-center justify-between mb-4">
                             <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Consistency Heatmap</h3>
                             <span className="text-[10px] text-zinc-600 font-mono">Last 365 Days</span>
                        </div>
                        <StreakHeatmap tasks={tasks} logs={logs} />
                    </div>
                </>
            )}

            {activeTab === 'calendar' && (
                <div className="animate-in fade-in duration-300">
                    <CalendarView tasks={tasks} logs={logs} />
                </div>
            )}

            {activeTab === 'stats' && (
                <div className="animate-in fade-in duration-300">
                    <StatsView tasks={tasks} logs={logs} />
                    
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 border border-zinc-800 bg-zinc-900/20 rounded-sm">
                            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Total Logged Days</h3>
                            <p className="text-3xl font-bold text-white">{Object.keys(logs).length}</p>
                        </div>
                        <div className="p-6 border border-zinc-800 bg-zinc-900/20 rounded-sm">
                            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Active Protocols</h3>
                            <p className="text-3xl font-bold text-white">{tasks.length}</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'data' && (
                <div className="animate-in fade-in duration-300 max-w-xl mx-auto space-y-8">
                    
                    <div className="bg-amber-950/10 border border-amber-900/30 p-6 rounded-sm">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="text-amber-500 shrink-0 mt-1" />
                            <div>
                                <h3 className="text-amber-500 font-bold mb-2">Local Storage Only</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                    Your data exists only on this device (<code className="text-amber-200/50 bg-amber-950/30 px-1 rounded">{deviceId.slice(0,8)}...</code>). 
                                    If you clear your browser cache or use a different device, your progress will be lost.
                                </p>
                                <p className="text-zinc-500 text-xs font-mono">
                                    RECOMMENDATION: Export a backup weekly.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-sm flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-bold mb-1">Backup Data</h3>
                                <p className="text-zinc-500 text-xs">Download your entire history as a JSON file.</p>
                            </div>
                            <Button onClick={handleExport} variant="primary" className="flex items-center gap-2">
                                <Download size={16} /> Export
                            </Button>
                        </div>

                        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-sm flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-bold mb-1">Restore Data</h3>
                                <p className="text-zinc-500 text-xs">Import a previously exported JSON file.</p>
                            </div>
                            <div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="application/json"
                                    className="hidden" 
                                />
                                <Button onClick={handleImportClick} variant="ghost" className="flex items-center gap-2 border border-zinc-700">
                                    <Upload size={16} /> Import
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

      </main>
    </div>
  );
};

export default App;