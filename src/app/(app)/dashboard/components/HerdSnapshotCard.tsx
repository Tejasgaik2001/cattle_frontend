import { UsersRound, Milk, Baby, HeartPulse, Sprout } from 'lucide-react';

interface HerdSnapshotCardProps {
  totalHerdSize: number;
  lactatingCowsCount: number;
  pregnantCowsCount: number;
  cowsUnderTreatmentCount: number;
  youngCattleCount: number;
}

const snapshotItems = [
  {
    key: 'totalHerdSize' as const,
    label: 'Total Cows',
    icon: UsersRound,
    color: 'text-slate-600 dark:text-slate-300',
    bg: 'bg-slate-100 dark:bg-slate-700',
  },
  {
    key: 'lactatingCowsCount' as const,
    label: 'Lactating',
    icon: Milk,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
  },
  {
    key: 'pregnantCowsCount' as const,
    label: 'Pregnant',
    icon: Baby,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/30',
  },
  {
    key: 'cowsUnderTreatmentCount' as const,
    label: 'Under Treatment',
    icon: HeartPulse,
    color: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/30',
  },
  {
    key: 'youngCattleCount' as const,
    label: 'Young Cattle',
    icon: Sprout,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/30',
  },
];

export function HerdSnapshotCard(props: HerdSnapshotCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Herd Snapshot</h3>
      <div className="space-y-2.5">
        {snapshotItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-md ${item.bg}`}>
                <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{props[item.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
