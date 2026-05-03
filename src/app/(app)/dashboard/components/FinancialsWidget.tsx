'use client';

import React, { useState, useEffect } from 'react';
import { 
    Wallet, 
    ArrowUpRight, 
    ArrowDownRight, 
    TrendingUp, 
    TrendingDown,
    Loader2
} from 'lucide-react';
import { financialApi } from '@/lib/api/financial';
import Link from 'next/link';

export function FinancialsWidget() {
    const [today, setToday] = useState<{ todayIncome: number; todayExpense: number } | null>(null);
    const [trend, setTrend] = useState<Array<{ date: string; income: number; expense: number }>>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [todayData, trendData] = await Promise.all([
                    financialApi.getTodaySummary(),
                    financialApi.getLast7DaysTrend()
                ]);
                setToday(todayData);
                setTrend(trendData);
            } catch (error) {
                console.error('Failed to fetch dashboard financial stats:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
            </div>
        );
    }

    const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm overflow-hidden relative">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-none">
                        <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Farm Finance</h3>
                </div>
                <Link 
                    href="/financials" 
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today's Income</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(today?.todayIncome || 0)}
                        </span>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today's Expense</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-red-600 dark:text-red-400">
                            {formatCurrency(today?.todayExpense || 0)}
                        </span>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Micro Sparkline or Trend visualization could go here */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">7-Day Trend</p>
                <div className="flex items-end justify-between h-12 gap-1 px-1">
                    {trend.map((day, i) => {
                        const maxVal = Math.max(...trend.map(d => Math.max(d.income, d.expense)), 100);
                        const incHeight = (day.income / maxVal) * 100;
                        const expHeight = (day.expense / maxVal) * 100;
                        
                        return (
                            <div key={i} className="flex-1 flex flex-col justify-end gap-[2px] group relative">
                                <div 
                                    className="w-full bg-emerald-400/30 group-hover:bg-emerald-400 rounded-sm transition-all"
                                    style={{ height: `${incHeight}%` }} />
                                <div 
                                    className="w-full bg-red-400/30 group-hover:bg-red-400 rounded-sm transition-all"
                                    style={{ height: `${expHeight}%` }} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
