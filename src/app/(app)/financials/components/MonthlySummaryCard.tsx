'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { MonthlySummary } from '../types';
import { TrendingUp, TrendingDown, Scale, AlertTriangle, Users } from 'lucide-react';

interface MonthlySummaryCardProps {
    summary: MonthlySummary;
    onMonthChange: (year: number, month: number) => void;
    year: number;
    month: number;
}

function formatCurrency(n: number) {
    return `₹${Math.abs(n).toLocaleString('en-IN')}`;
}

const PIE_COLORS = [
    '#f97316', '#ef4444', '#8b5cf6', '#3b82f6',
    '#ec4899', '#14b8a6', '#f59e0b', '#6366f1', '#10b981',
];

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export function MonthlySummaryCard({ summary, onMonthChange, year, month }: MonthlySummaryCardProps) {
    const isProfit = summary.netBalance >= 0;

    const goToPrevMonth = () => {
        if (month === 0) { onMonthChange(year - 1, 11); }
        else { onMonthChange(year, month - 1); }
    };

    const goToNextMonth = () => {
        const now = new Date();
        if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth())) return;
        if (month === 11) { onMonthChange(year + 1, 0); }
        else { onMonthChange(year, month + 1); }
    };

    const canGoNext = !(year >= new Date().getFullYear() && month >= new Date().getMonth());

    return (
        <div className="space-y-6">
            {/* Period Navigation */}
            <div className="flex items-center justify-between">
                <button onClick={goToPrevMonth} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 font-bold transition-colors">‹ Prev</button>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{summary.period}</h2>
                <button onClick={goToNextMonth} disabled={!canGoNext} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 font-bold transition-colors disabled:opacity-30">Next ›</button>
            </div>

            {/* Summary Cards Row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Income</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{formatCurrency(summary.totalIncome)}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">Expense</span>
                    </div>
                    <p className="text-2xl font-black text-red-700 dark:text-red-400">{formatCurrency(summary.totalExpenses)}</p>
                </div>
                <div className={`border rounded-2xl p-4 ${isProfit ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <Scale className="h-4 w-4 text-teal-600" />
                        <span className={`text-xs font-semibold uppercase tracking-wide ${isProfit ? 'text-teal-700 dark:text-teal-400' : 'text-orange-700 dark:text-orange-400'}`}>Net</span>
                    </div>
                    <p className={`text-2xl font-black ${isProfit ? 'text-teal-700 dark:text-teal-400' : 'text-orange-700 dark:text-orange-400'}`}>
                        {isProfit ? '+' : '-'}{formatCurrency(summary.netBalance)}
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expense Pie */}
                <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Expense by Category</h3>
                    {summary.expenseByCategory.length === 0 ? (
                        <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No expenses this month</div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={summary.expenseByCategory}
                                        dataKey="amount"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={3}>
                                        {summary.expenseByCategory.map((_, index) => (
                                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                                        contentStyle={{ background: 'var(--tw-color-slate-800, #1e293b)', border: 'none', borderRadius: '12px', padding: '8px 12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {summary.expenseByCategory.map((e, i) => (
                                    <div key={e.category} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                            <span className="text-sm text-slate-600 dark:text-slate-400">{e.category}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400">{e.percentage}%</span>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(e.amount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Income breakdown */}
                <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Income Sources</h3>
                    {summary.incomeByCategory.length === 0 ? (
                        <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">No income this month</div>
                    ) : (
                        <div className="space-y-3 mt-4">
                            {summary.incomeByCategory.map((ic, i) => (
                                <div key={ic.category}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{ic.category}</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(ic.amount)}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${ic.percentage}%`, background: '#10b981' }} />
                                    </div>
                                    <p className="text-right text-xs text-slate-400 mt-0.5">{ic.percentage}%</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Spending by person / Reimbursements */}
            {summary.spendingByPerson.length > 0 && (
                <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        <h3 className="font-bold text-slate-900 dark:text-white">Spending by Person</h3>
                    </div>
                    <div className="space-y-3">
                        {summary.spendingByPerson.map((sp) => (
                            <div key={sp.personId} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                                        {sp.name[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{sp.name}</p>
                                        <p className="text-xs text-slate-400 capitalize">{sp.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(sp.amount)}</span>
                                    {sp.pendingReimbursement && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-semibold">
                                            <AlertTriangle className="h-3 w-3" />
                                            Reimburse
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
