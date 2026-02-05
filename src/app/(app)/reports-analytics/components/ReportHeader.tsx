import React from 'react';
import type { ReportPeriod } from '../types';
import { Button } from '@/components/ui/button';
import { Download, ChevronDown } from 'lucide-react';

interface ReportHeaderProps {
  currentPeriod: ReportPeriod;
  onSelectPeriod?: (period: ReportPeriod) => void; // Placeholder for period selection
  onExportData?: (reportType: string, format: 'CSV' | 'PDF') => void;
  reportTitle: string;
}

export function ReportHeader({ currentPeriod, onSelectPeriod, onExportData, reportTitle }: ReportHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{reportTitle}</h2>
      <div className="flex gap-2">
        {/* Period Selector - Placeholder */}
        <Button variant="outline" className="flex items-center text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
          {currentPeriod.label} <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
        <Button onClick={() => onExportData?.(reportTitle, 'CSV')} className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white">
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>
    </div>
  );
}
