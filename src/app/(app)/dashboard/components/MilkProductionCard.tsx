import { ArrowUp, ArrowDown, Droplets, Users } from 'lucide-react';

interface MilkProductionCardProps {
  todayMilkTotal: number;
  yesterdayMilkTotal: number;
  milkingCowsCount: number;
}

export function MilkProductionCard({ todayMilkTotal, yesterdayMilkTotal, milkingCowsCount }: MilkProductionCardProps) {
  const percentageChange = yesterdayMilkTotal > 0
    ? ((todayMilkTotal - yesterdayMilkTotal) / yesterdayMilkTotal) * 100
    : 0;
  const isPositive = percentageChange >= 0;

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
          <Droplets className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Today's Milk Production</h3>
      </div>

      {/* Main metric */}
      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-4xl font-bold text-slate-900 dark:text-white">{todayMilkTotal.toFixed(1)}</p>
        <span className="text-lg font-medium text-slate-500 dark:text-slate-400">Liters</span>
      </div>

      {/* Change vs yesterday */}
      <div className={`flex items-center gap-1 text-sm font-medium mb-4 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
        {isPositive
          ? <ArrowUp className="h-4 w-4" />
          : <ArrowDown className="h-4 w-4" />}
        <span>{Math.abs(percentageChange).toFixed(1)}% vs yesterday</span>
      </div>

      {/* Sub-metric: milking cows */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
        <Users className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          <strong className="text-slate-700 dark:text-slate-300">{milkingCowsCount}</strong> Milking Cows
        </span>
      </div>
    </div>
  );
}
