'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
    Wallet, 
    Plus, 
    History, 
    PieChart as PieChartIcon, 
    Users, 
    Building2,
    Loader2,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Settings,
    Scale
} from 'lucide-react';
import { financialApi } from '@/lib/api/financial';
import { loansApi } from '@/lib/api/loans';
import { peopleApi } from '@/lib/api/people';
import { getFarmId } from '@/lib/farm';
import { 
    FinancialTransaction, 
    Loan, 
    Person, 
    MonthlySummary, 
    FinancialsTab 
} from './types';

// Components
import { TransactionList } from './components/TransactionList';
import { LoanCard } from './components/LoanCard';
import { MonthlySummaryCard } from './components/MonthlySummaryCard';
import { PeopleManager } from './components/PeopleManager';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AddLoanModal } from './components/AddLoanModal';
import { ReimbursementsTab } from './components/ReimbursementsTab';
import { FinancialCategoriesTab } from './components/FinancialCategoriesTab';

export default function FinancialsPage() {
    const [activeTab, setActiveTab] = useState<FinancialsTab>('summary');
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState<MonthlySummary | null>(null);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [people, setPeople] = useState<Person[]>([]);
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    
    // Modal states
    const [showTxModal, setShowTxModal] = useState(false);
    const [showLoanModal, setShowLoanModal] = useState(false);
    
    // Period state
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth());

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const farmId = await getFarmId();
            
            // Initial data fetch
            const [summaryData, loansData, peopleData, txData] = await Promise.all([
                financialApi.getMonthlySummary(year, month),
                loansApi.getAll(),
                peopleApi.getAll(),
                financialApi.getTransactions(farmId, { limit: 20 })
            ]);

            setSummary(summaryData);
            setLoans(loansData);
            setPeople(peopleData);
            setTransactions(txData.data || []);
            
            // Ensure at least one owner exists for the farm
            if (!peopleData.find(p => p.role === 'owner')) {
                await peopleApi.ensureOwner();
                const updatedPeople = await peopleApi.getAll();
                setPeople(updatedPeople);
            }
        } catch (error) {
            console.error('Failed to fetch financial data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [year, month]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleMonthChange = (newYear: number, newMonth: number) => {
        setYear(newYear);
        setMonth(newMonth);
    };

    const tabs: { id: FinancialsTab; label: string; icon: any }[] = [
        { id: 'summary', label: 'Summary', icon: PieChartIcon },
        { id: 'transactions', label: 'Transactions', icon: History },
        { id: 'loans', label: 'Loans', icon: Building2 },
        { id: 'reimbursements', label: 'Member Dues', icon: Users },
        { id: 'categories', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 pb-24 lg:pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-none">
                            <Wallet className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Farm Financials</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Track your farm's money, loans, and expenses in one place.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowLoanModal(true)}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                        <Building2 className="h-5 w-5" />
                        Add Loan
                    </button>
                    <button 
                        onClick={() => setShowTxModal(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none active:scale-95">
                        <Plus className="h-5 w-5" />
                        Add Transaction
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid (Always Visible) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Income</p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            {summary ? `₹${summary.totalIncome.toLocaleString()}` : '...'}
                        </h3>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                            <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Expense</p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-red-600 dark:text-red-400">
                            {summary ? `₹${summary.totalExpenses.toLocaleString()}` : '...'}
                        </h3>
                        <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-xl">
                            <ArrowDownRight className="h-5 w-5 text-red-600" />
                        </div>
                    </div>
                </div>
                {/* Business Cash Balance (Estimated) */}
                <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Business Cash</p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            ₹{Number((summary?.netBalance || 0) + 
                                (summary?.spendingByPerson || []).reduce((sum, p) => sum + (Number(p.businessOwes) || 0) - (Number(p.owesBusiness) || 0), 0)
                            ).toLocaleString()}
                        </h3>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                            <Scale className="h-5 w-5 text-emerald-600" />
                        </div>
                    </div>
                </div>

                {/* Member Dues Quick Stat */}
                <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Member Dues</p>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-black text-amber-600 dark:text-amber-500">
                                Owes: ₹{(summary?.spendingByPerson || []).reduce((sum, p) => sum + (Number(p.businessOwes) || 0), 0).toLocaleString()}
                            </h3>
                            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                Due: ₹{(summary?.spendingByPerson || []).reduce((sum, p) => sum + (Number(p.owesBusiness) || 0), 0).toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-900/30 rounded-xl">
                            <Users className="h-5 w-5 text-slate-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8 w-fit overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}>
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-[2rem] gap-4">
                    <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
                    <p className="text-slate-500 font-medium">Updating financials...</p>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'summary' && summary && (
                        <MonthlySummaryCard 
                            summary={summary} 
                            onMonthChange={handleMonthChange}
                            year={year}
                            month={month}
                        />
                    )}

                    {activeTab === 'transactions' && (
                        <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <History className="h-5 w-5 text-emerald-600" />
                                    Transaction History
                                </h2>
                            </div>
                            <TransactionList transactions={transactions} isLoading={isLoading} />
                        </div>
                    )}

                    {activeTab === 'loans' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {loans.length === 0 ? (
                                <div className="col-span-full py-20 text-center bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 rounded-[2rem]">
                                    <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">No active loans found.</p>
                                </div>
                            ) : (
                                loans.map(loan => (
                                    <LoanCard key={loan.id} loan={loan} onUpdate={fetchData} />
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'reimbursements' && (
                        <ReimbursementsTab farmId="" />
                    )}

                    {activeTab === 'categories' && (
                        <FinancialCategoriesTab />
                    )}

                    {activeTab === 'people' && (
                        <PeopleManager farmId="" />
                    )}
                </div>
            )}

            {/* Modals */}
            <AddTransactionModal 
                open={showTxModal} 
                onClose={() => setShowTxModal(false)} 
                onSuccess={fetchData} 
            />
            <AddLoanModal 
                isOpen={showLoanModal} 
                onClose={() => setShowLoanModal(false)} 
                onSuccess={fetchData} 
            />
        </div>
    );
}
