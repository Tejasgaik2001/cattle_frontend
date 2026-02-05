import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MilkProductionTrendData } from '../types';

interface MilkProductionReportProps {
  data: MilkProductionTrendData[];
  onDrillDownMilkTrend?: (dateRange: { startDate: string; endDate: string }) => void;
}

export function MilkProductionReport({ data, onDrillDownMilkTrend }: MilkProductionReportProps) {
  return (
    <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Milk Production Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="month" stroke="#64748b" className="dark:stroke-slate-400" />
              <YAxis stroke="#64748b" className="dark:stroke-slate-400" />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgb(var(--color-slate-800))', borderColor: 'rgb(var(--color-slate-700))', borderRadius: '0.5rem' }}
                itemStyle={{ color: 'rgb(var(--color-slate-200))' }}
              />
              <Line type="monotone" dataKey="totalMilk" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-4">Detailed Data</h3>
        <Table className="w-full font-inter">
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900/60 border-b-slate-200 dark:border-b-slate-700">
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Month</TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Milk (L)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
            {data.map((item) => (
              <TableRow key={item.month} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <TableCell className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{item.month}</TableCell>
                <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-right text-slate-700 dark:text-slate-300">{item.totalMilk.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
