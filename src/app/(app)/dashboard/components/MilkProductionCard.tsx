import { ArrowUp, ArrowDown } from 'lucide-react';

interface MilkProductionCardProps {
  todayMilkTotal: number;
  yesterdayMilkTotal: number;
}

export function MilkProductionCard({ todayMilkTotal, yesterdayMilkTotal }: MilkProductionCardProps) {
  const percentageChange = yesterdayMilkTotal > 0
    ? ((todayMilkTotal - yesterdayMilkTotal) / yesterdayMilkTotal) * 100
    : 0;
  const isPositive = percentageChange >= 0;

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">Today's Milk Production</h3>
      <div className="mt-4 flex items-baseline">
        <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{todayMilkTotal.toFixed(1)}</p>
        <span className="ml-2 text-lg text-slate-500 dark:text-slate-400">Liters</span>
      </div>
      <div className={`mt-2 flex items-center text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
        {isPositive ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
        <span>{Math.abs(percentageChange).toFixed(1)}% from yesterday</span>
      </div>
      {/* Optional: Add a subtle 7-day trend graph here later */}
    </div>
  );
}
