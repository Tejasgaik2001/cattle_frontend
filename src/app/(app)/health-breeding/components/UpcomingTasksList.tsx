import type { HealthBreedingTask } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Info, CheckCircle, ChevronRight, Calendar } from 'lucide-react';

interface UpcomingTasksListProps {
  tasks: HealthBreedingTask[];
  onViewTaskDetails?: (taskId: string, cowId: string) => void;
}

const urgencyIcons = {
  high: <AlertTriangle className="h-5 w-5 text-red-500" />,
  medium: <Info className="h-5 w-5 text-amber-500" />,
  low: <CheckCircle className="h-5 w-5 text-emerald-500" />,
};

export function UpcomingTasksList({ tasks, onViewTaskDetails }: UpcomingTasksListProps) {
  // Sort tasks by due date
  const sortedTasks = tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
      <CardHeader className="pb-4 bg-slate-50/30 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-6">
             <CheckCircle className="h-10 w-10 text-emerald-500/20 mx-auto mb-2" />
             <p className="text-slate-500 dark:text-slate-400 font-medium">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onViewTaskDetails?.(task.id, task.cowId)}
                className="flex items-center p-4 rounded-2xl cursor-pointer transition-all bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 group shadow-sm hover:shadow-md"
              >
                <div className="flex-shrink-0 mr-4 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800">
                  {urgencyIcons[task.urgency] || urgencyIcons.medium}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase text-[10px] tracking-widest">{task.message}</p>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1.5" />
                    Due: {new Date(task.dueDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
