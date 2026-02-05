import { UsersRound, Syringe, Baby, HeartPulse } from 'lucide-react';

interface HerdSnapshotCardProps {
  totalHerdSize: number;
  lactatingCowsCount: number;
  pregnantCowsCount: number;
  cowsUnderTreatmentCount: number;
}

const snapshotItems = [
  { key: 'totalHerdSize', label: 'Total Herd', icon: UsersRound },
  { key: 'lactatingCowsCount', label: 'Lactating', icon: Syringe }, // Using Syringe to represent milking
  { key: 'pregnantCowsCount', label: 'Pregnant', icon: Baby },
  { key: 'cowsUnderTreatmentCount', label: 'Under Treatment', icon: HeartPulse },
];

export function HerdSnapshotCard(props: HerdSnapshotCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Herd Snapshot</h3>
      <div className="grid grid-cols-2 gap-4">
        {snapshotItems.map((item) => (
          <div key={item.key} className="flex items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <item.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mr-3" />
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{props[item.key as keyof HerdSnapshotCardProps]}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
