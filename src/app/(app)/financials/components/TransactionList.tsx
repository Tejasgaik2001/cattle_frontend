'use client';

import React from 'react';
import type { FinancialTransaction } from '../types';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';

interface TransactionListProps {
    transactions: FinancialTransaction[];
    isLoading?: boolean;
}

function formatCurrency(n: number) {
    return `₹${n.toLocaleString('en-IN')}`;
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const categoryColors: Record<string, string> = {
    'Feed': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Medical': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Labor': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Infrastructure': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    'Veterinary': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    'Milk Sales': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Cow Sales': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    'Cow Dung Sales': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    'Other Income': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',

};

function getCategoryColor(cat: string) {
    return categoryColors[cat] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
}

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No transactions yet</p>
                <p className="text-sm mt-1">Use the "Add Transaction" button to get started</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {transactions.map((tx) => (
                <div
                    key={tx.id}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:border-slate-200 dark:hover:border-slate-600 transition-all group">
                    {/* Icon */}
                    <div className={`flex-shrink-0 p-2 rounded-xl ${tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
                        {tx.type === 'income'
                            ? <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            : <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(tx.category)}`}>
                                {tx.category}
                            </span>
                            {tx.paidBy && tx.paidBy.role !== 'owner' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                    ⚠️ Reimburse: {tx.paidBy.name}
                                </span>
                            )}
                            {tx.paidBy && tx.paidBy.role === 'owner' && (
                                <span className="text-xs text-slate-400">by {tx.paidBy.name}</span>
                            )}
                        </div>
                        {tx.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{tx.description}</p>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="text-right flex-shrink-0">
                        <p className={`text-base font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(tx.date)}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
