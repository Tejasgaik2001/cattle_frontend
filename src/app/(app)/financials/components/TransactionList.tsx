'use client';

import React, { useState } from 'react';
import type { FinancialTransaction } from '../types';
import { AlertCircle, TrendingDown, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

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

type DateRangeOption = '1month' | '6months' | '1year' | 'all' | 'custom';

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState<DateRangeOption>('1month');
    const [customDateRange, setCustomDateRange] = useState({
        from: '',
        to: '',
    });

    const getDateRange = (option: DateRangeOption) => {
        const now = new Date();
        const from = new Date();
        
        switch (option) {
            case '1month':
                from.setMonth(now.getMonth() - 1);
                return { from: from.toISOString().split('T')[0], to: now.toISOString().split('T')[0] };
            case '6months':
                from.setMonth(now.getMonth() - 6);
                return { from: from.toISOString().split('T')[0], to: now.toISOString().split('T')[0] };
            case '1year':
                from.setFullYear(now.getFullYear() - 1);
                return { from: from.toISOString().split('T')[0], to: now.toISOString().split('T')[0] };
            case 'all':
                return { from: '', to: '' };
            case 'custom':
                return customDateRange;
            default:
                return { from: '', to: '' };
        }
    };

    const handleExportToExcel = () => {
        try {
            const dateRange = getDateRange(selectedRange);
            const exportData: any[] = [];
            
            transactions.forEach(tx => {
                const txDate = new Date(tx.date);
                
                // Filter by date range if provided
                if (dateRange.from && new Date(dateRange.from) > txDate) return;
                if (dateRange.to && new Date(dateRange.to) < txDate) return;

                exportData.push({
                    'Date': formatDate(tx.date),
                    'Type': tx.type === 'income' ? 'Income' : 'Expense',
                    'Category': tx.category,
                    'Amount': tx.amount,
                    'Description': tx.description || 'N/A',
                    'Paid By': tx.paidBy?.name || 'N/A',
                });
            });

            if (exportData.length === 0) {
                toast.error('No data to export for the selected date range');
                return;
            }

            // Convert to Excel
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
            
            const fileName = `transactions-${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
            toast.success('Exported to Excel successfully');
            setExportDialogOpen(false);
        } catch (error) {
            toast.error('Failed to export to Excel');
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);
    const totalPages = Math.ceil(transactions.length / itemsPerPage);

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
        <div className="space-y-4">
            {/* Header with Export Button */}
            <div className="flex justify-end">
                <Button onClick={() => setExportDialogOpen(true)} variant="outline" className="border-slate-300 dark:border-slate-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                </Button>
            </div>

            {/* Transaction List */}
            <div className="space-y-2">
                {paginatedTransactions.map((tx) => (
                    <div
                        key={tx.id}
                        className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 transition-all group">
                        {/* Icon */}
                        <div className={`flex-shrink-0 p-2 rounded-xl ${tx.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
                            {tx.type === 'income'
                                ? <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                : <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />}
                        </div>

                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(tx.category)}`}>
                                    {tx.category}
                                </span>
                                {tx.paidBy && tx.paidBy.role !== 'owner' && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                        ⚠️ Reimburse: {tx.paidBy.name}
                                    </span>
                                )}
                            </div>
                            {tx.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{tx.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500">
                                <span>{formatDate(tx.date)}</span>
                                {tx.paidBy && (
                                    <span>• {tx.paidBy.name}</span>
                                )}
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="text-right flex-shrink-0">
                            <p className={`text-base font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {transactions.length > itemsPerPage && (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, transactions.length)} of {transactions.length} transactions
                    </p>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            variant="outline"
                            size="sm"
                            className="border-slate-300 dark:border-slate-700"
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            size="sm"
                            className="border-slate-300 dark:border-slate-700"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Export Dialog */}
            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Export Transactions to Excel</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Date Range</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant={selectedRange === '1month' ? 'default' : 'outline'}
                                    onClick={() => setSelectedRange('1month')}
                                    className="w-full"
                                >
                                    Last 1 Month
                                </Button>
                                <Button
                                    variant={selectedRange === '6months' ? 'default' : 'outline'}
                                    onClick={() => setSelectedRange('6months')}
                                    className="w-full"
                                >
                                    Last 6 Months
                                </Button>
                                <Button
                                    variant={selectedRange === '1year' ? 'default' : 'outline'}
                                    onClick={() => setSelectedRange('1year')}
                                    className="w-full"
                                >
                                    Last 1 Year
                                </Button>
                                <Button
                                    variant={selectedRange === 'all' ? 'default' : 'outline'}
                                    onClick={() => setSelectedRange('all')}
                                    className="w-full"
                                >
                                    All Time
                                </Button>
                            </div>
                        </div>

                        {selectedRange === 'custom' && (
                            <div className="space-y-2">
                                <Label>Custom Date Range</Label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <Label htmlFor="customFrom" className="text-xs">From:</Label>
                                        <Input
                                            id="customFrom"
                                            type="date"
                                            value={customDateRange.from}
                                            onChange={(e) => setCustomDateRange({ ...customDateRange, from: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Label htmlFor="customTo" className="text-xs">To:</Label>
                                        <Input
                                            id="customTo"
                                            type="date"
                                            value={customDateRange.to}
                                            onChange={(e) => setCustomDateRange({ ...customDateRange, to: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedRange !== 'custom' && (
                            <Button
                                variant="outline"
                                onClick={() => setSelectedRange('custom')}
                                className="w-full"
                            >
                                Custom Date Range
                            </Button>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleExportToExcel}>
                            Export Excel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
