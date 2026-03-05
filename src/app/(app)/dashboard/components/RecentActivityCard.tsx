import { Droplets, HeartPulse, Syringe, PlusCircle, Receipt, Activity } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { ActivityItem } from '../types';

interface RecentActivityCardProps {
  activities: ActivityItem[];
}

const activityConfig: Record<ActivityItem['type'], { icon: React.ElementType; color: string; bg: string }> = {
  milk_recorded: { icon: Droplets, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  treatment_added: { icon: HeartPulse, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
  vaccination_completed: { icon: Syringe, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30' },
  cow_added: { icon: PlusCircle, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/30' },
  expense_recorded: { icon: Receipt, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
};

function getRelativeTime(iso: string) {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function RecentActivityCard({ activities }: RecentActivityCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
          <Activity className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recent Activity</h3>
      </div>

      {/* Activity list */}
      <div className="p-3 space-y-1 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-xs text-slate-400 dark:text-slate-500">
            No recent activity to show.
          </div>
        ) : (
          activities.slice(0, 8).map((item) => {
            const config = activityConfig[item.type] ?? { icon: Activity, color: 'text-slate-500', bg: 'bg-slate-100' };
            const Icon = config.icon;
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
              >
                <div className={`p-1.5 rounded-md ${config.bg} flex-shrink-0 mt-0.5`}>
                  <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{item.description}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Cow #{item.cowTag} · {getRelativeTime(item.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
