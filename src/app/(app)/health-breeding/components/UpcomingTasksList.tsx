import type { HealthBreedingTask } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../shell/components/ui/card';
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
    <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTasks.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No upcoming tasks.</p>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onViewTaskDetails?.(task.id, task.cowId)}
                className="flex items-center p-3 rounded-lg cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex-shrink-0 mr-3">
                  {urgencyIcons[task.urgency] || urgencyIcons.medium}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{task.message}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
