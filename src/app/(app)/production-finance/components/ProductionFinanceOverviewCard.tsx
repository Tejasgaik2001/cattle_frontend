import type { ProductionFinanceOverview } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';

interface ProductionFinanceOverviewCardProps {
  overview: ProductionFinanceOverview;
  onPeriodChange?: (period: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
};

export function ProductionFinanceOverviewCard({ overview, onPeriodChange }: ProductionFinanceOverviewCardProps) {
  const overviewItems = [
    { key: 'totalMilkProduction', label: 'Milk Production', icon: Droplets, value: `${overview.totalMilkProduction.toFixed(1)} L` },
    { key: 'totalIncome', label: 'Total Income', icon: TrendingUp, value: formatCurrency(overview.totalIncome) },
    { key: 'totalExpenses', label: 'Total Expenses', icon: TrendingDown, value: formatCurrency(overview.totalExpenses) },
    { key: 'netProfitLoss', label: 'Net Profit/Loss', icon: IndianRupee, value: formatCurrency(overview.netProfitLoss) },
  ];

  return (
    <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Overview</CardTitle>
        <div className="text-sm text-slate-500 dark:text-slate-400">{overview.currentPeriod}</div>
        {/* Optional: Add period switcher here later */}
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overviewItems.map((item) => (
          <div key={item.key} className="flex flex-col p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div className="flex items-center text-slate-500 dark:text-slate-400 mb-2">
              <item.icon className="h-4 w-4 mr-2" />
              <span className="text-xs font-medium">{item.label}</span>
            </div>
            <p className={`text-2xl font-bold ${item.key === 'netProfitLoss' && overview.netProfitLoss < 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
              {item.value}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
