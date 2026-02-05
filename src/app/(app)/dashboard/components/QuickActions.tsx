import { Droplets, HeartPulse, PlusCircle } from 'lucide-react';

interface QuickActionsProps {
  onRecordMilk?: () => void;
  onLogHealthEvent?: () => void;
  onAddCow?: () => void;
}

const actions = [
  { label: 'Record Milk', icon: Droplets, callbackKey: 'onRecordMilk' },
  { label: 'Log Health Event', icon: HeartPulse, callbackKey: 'onLogHealthEvent' },
  { label: 'Add Cow', icon: PlusCircle, callbackKey: 'onAddCow' },
];

export function QuickActions(props: QuickActionsProps) {
  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-4">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={props[action.callbackKey as keyof QuickActionsProps]}
            className="flex flex-col items-center justify-center p-4 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <action.icon className="h-6 w-6 mb-2" />
            <span className="text-sm text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
