import { Droplets, HeartPulse, PlusCircle, Receipt } from 'lucide-react';

interface QuickActionsProps {
  onRecordMilk?: () => void;
  onLogHealthEvent?: () => void;
  onAddCow?: () => void;
  onRecordExpense?: () => void;
}

const actions = [
  {
    label: 'Record Milk',
    icon: Droplets,
    callbackKey: 'onRecordMilk' as const,
    color: 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700',
  },
  {
    label: 'Log Health Event',
    icon: HeartPulse,
    callbackKey: 'onLogHealthEvent' as const,
    color: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
  },
  {
    label: 'Add Cow',
    icon: PlusCircle,
    callbackKey: 'onAddCow' as const,
    color: 'bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700',
  },
  {
    label: 'Record Expense',
    icon: Receipt,
    callbackKey: 'onRecordExpense' as const,
    color: 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700',
  },
];

export function QuickActions(props: QuickActionsProps) {
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={props[action.callbackKey]}
            className={`flex flex-col items-center justify-center gap-2 py-4 px-3 ${action.color} text-white font-medium rounded-xl transition-all duration-150 shadow-sm hover:shadow-md active:scale-95`}
          >
            <action.icon className="h-5 w-5" />
            <span className="text-xs text-center leading-tight">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
