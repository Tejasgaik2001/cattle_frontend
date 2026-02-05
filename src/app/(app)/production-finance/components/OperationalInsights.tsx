import type { CowPerformanceMetric, ExpenseCategoryMetric } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface OperationalInsightsProps {
  topProducingCows: CowPerformanceMetric[];
  lowProducingCows: CowPerformanceMetric[];
  highestExpenseCategories: ExpenseCategoryMetric[];
  onViewCowDetails?: (cowId: string) => void;
}

export function OperationalInsights({ topProducingCows, lowProducingCows, highestExpenseCategories, onViewCowDetails }: OperationalInsightsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Top Producing Cows</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {topProducingCows.map((cow) => (
              <li key={cow.cowId} onClick={() => onViewCowDetails?.(cow.cowId)} className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{cow.name || cow.tagId}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{cow.tagId}</p>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{cow.avgDailyMilk.toFixed(1)} L/day</span>
                  <ChevronRight className="h-4 w-4 text-slate-400 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Low Producing Cows</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {lowProducingCows.map((cow) => (
              <li key={cow.cowId} onClick={() => onViewCowDetails?.(cow.cowId)} className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{cow.name || cow.tagId}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{cow.tagId}</p>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{cow.avgDailyMilk.toFixed(1)} L/day</span>
                  <ChevronRight className="h-4 w-4 text-slate-400 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Highest Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {highestExpenseCategories.map((category) => (
              <li key={category.categoryName} className="flex items-center justify-between">
                <p className="font-medium text-slate-800 dark:text-slate-100">{category.categoryName}</p>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(category.totalAmount)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
