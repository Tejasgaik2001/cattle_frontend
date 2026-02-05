import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FinancialTrendData, ExpenseBreakdownData } from '../types';

interface FinancialPerformanceReportProps {
  incomeExpenseTrend: FinancialTrendData[];
  expenseBreakdown: ExpenseBreakdownData[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
};

export function FinancialPerformanceReport({ incomeExpenseTrend, expenseBreakdown }: FinancialPerformanceReportProps) {
  return (
    <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Financial Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Income vs Expenses Trend */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Income vs Expenses (Monthly)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={incomeExpenseTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="month" stroke="#64748b" className="dark:stroke-slate-400" />
              <YAxis stroke="#64748b" className="dark:stroke-slate-400" tickFormatter={formatCurrency} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgb(var(--color-slate-800))', borderColor: 'rgb(var(--color-slate-700))', borderRadius: '0.5rem' }}
                itemStyle={{ color: 'rgb(var(--color-slate-200))' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit/Loss" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-4">Expense Breakdown by Category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expenseBreakdown} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="category" stroke="#64748b" className="dark:stroke-slate-400" />
              <YAxis stroke="#64748b" className="dark:stroke-slate-400" tickFormatter={formatCurrency} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgb(var(--color-slate-800))', borderColor: 'rgb(var(--color-slate-700))', borderRadius: '0.5rem' }}
                itemStyle={{ color: 'rgb(var(--color-slate-200))' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="amount" fill="#3b82f6" name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Data Tables (Optional - could be expanded) */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-4">Detailed Financial Data</h3>
        <Table className="w-full font-inter">
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900/60 border-b-slate-200 dark:border-b-slate-700">
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Month</TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Income</TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expenses</TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Profit/Loss</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
            {incomeExpenseTrend.map((item) => (
              <TableRow key={item.month} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <TableCell className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{item.month}</TableCell>
                <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-right text-slate-700 dark:text-slate-300">{formatCurrency(item.income)}</TableCell>
                <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-right text-slate-700 dark:text-slate-300">{formatCurrency(item.expenses)}</TableCell>
                <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-right text-slate-700 dark:text-slate-300">{formatCurrency(item.profit)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
