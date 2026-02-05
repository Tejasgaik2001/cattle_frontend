import type { ProductionFinanceProps } from '../types';
import { ProductionFinanceOverviewCard } from './ProductionFinanceOverviewCard';
import { OperationalInsights } from './OperationalInsights';
import { MilkEntryTable } from './MilkEntryTable';
import { FinancialTransactionForm } from './FinancialTransactionForm';
import { Button } from '@/components/ui/button';
import { PlusCircle, Droplets } from 'lucide-react';

export function ProductionFinance({
  overview,
  topProducingCows,
  lowProducingCows,
  highestExpenseCategories,
  onRecordMilkBulk,
  onLogFinancialTransaction,
  onViewCowDetails,
  onPeriodChange,
}: ProductionFinanceProps) {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Production & Finance</h2>
        <div className="flex space-x-2">
          <Button onClick={onRecordMilkBulk} variant="outline" className="text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
            <Droplets className="h-4 w-4 mr-2" />
            Record Milk
          </Button>
          <Button onClick={onLogFinancialTransaction} className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white">
            <PlusCircle className="h-4 w-4 mr-2" />
            Log Transaction
          </Button>
        </div>
      </div>
      <ProductionFinanceOverviewCard overview={overview} onPeriodChange={onPeriodChange} />
      <OperationalInsights
        topProducingCows={topProducingCows}
        lowProducingCows={lowProducingCows}
        highestExpenseCategories={highestExpenseCategories}
        onViewCowDetails={onViewCowDetails}
      />
      <MilkEntryTable />
      <FinancialTransactionForm />
    </div>
  );
}
