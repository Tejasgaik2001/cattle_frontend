import type { Alert } from '../types';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface AlertsCardProps {
  alerts: Alert[];
  onViewAlertAction?: (alertId: string, cowId: string) => void;
}

const alertIcons = {
  high: <AlertTriangle className="h-5 w-5 text-red-500" />,
  medium: <Info className="h-5 w-5 text-amber-500" />,
  low: <CheckCircle className="h-5 w-5 text-emerald-500" />,
};

export function AlertsCard({ alerts, onViewAlertAction }: AlertsCardProps) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm flex items-center justify-center h-full">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
          <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">All Clear!</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">No critical alerts at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Critical Alerts</h3>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => onViewAlertAction?.(alert.id, alert.cowId)}
            className="flex items-start p-4 rounded-lg cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex-shrink-0 mr-4">
              {alertIcons[alert.priority] || alertIcons.medium}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800 dark:text-slate-100">{alert.title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
