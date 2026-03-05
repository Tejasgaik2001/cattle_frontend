import type { Alert } from '../types';
import { AlertTriangle, Info, CheckCircle, ChevronRight, Bell } from 'lucide-react';

interface AlertsCardProps {
  alerts: Alert[];
  onViewAlertAction?: (alertId: string, cowId: string) => void;
  onViewAll?: () => void;
}

const alertTypeIcons: Record<Alert['priority'], React.ReactNode> = {
  high: <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />,
  medium: <Info className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />,
  low: <Bell className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />,
};

const alertTypeBadge: Record<string, string> = {
  vaccination_due: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  health_issue: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  missing_data: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

export function AlertsCard({ alerts, onViewAlertAction, onViewAll }: AlertsCardProps) {
  const visibleAlerts = alerts.slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="h-4 w-4 text-red-500" />
          Alerts
          {alerts.length > 0 && (
            <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
              {alerts.length}
            </span>
          )}
        </h3>
      </div>

      {/* List */}
      <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {visibleAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-500 mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">All Clear!</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No critical alerts right now.</p>
          </div>
        ) : (
          visibleAlerts.map((alert) => (
            <button
              key={alert.id}
              onClick={() => onViewAlertAction?.(alert.id, alert.cowId)}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
            >
              {alertTypeIcons[alert.priority]}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{alert.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {alert.cowTag ? `Cow #${alert.cowTag}` : alert.message}
                </p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 flex-shrink-0 mt-0.5" />
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      {alerts.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onViewAll}
            className="w-full text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
          >
            View All Alerts →
          </button>
        </div>
      )}
    </div>
  );
}
