'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { X, Building2, Loader2 } from 'lucide-react';
import { loansApi, type CreateLoanDto } from '@/lib/api/loans';

interface AddLoanModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddLoanModal({ open, onClose, onSuccess }: AddLoanModalProps) {
    const [lenderName, setLenderName] = useState('');
    const [principalAmount, setPrincipalAmount] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'simple' | 'compound'>('simple');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lenderName || !principalAmount || !startDate) {
            toast.error('Please fill in Lender Name, Amount and Start Date');
            return;
        }
        try {
            setIsSaving(true);
            await loansApi.create({
                lenderName,
                principalAmount: parseFloat(principalAmount),
                interestRate: parseFloat(interestRate) || 0,
                startDate,
                type,
                notes: notes || undefined,
            });
            toast.success('Loan added!');
            onSuccess();
            onClose();
            setLenderName('');
            setPrincipalAmount('');
            setInterestRate('');
            setNotes('');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save loan');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40">
                            <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Loan</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Lender Name *</label>
                        <input
                            type="text"
                            placeholder="e.g., SBI Bank or Ramesh Uncle"
                            value={lenderName}
                            onChange={(e) => setLenderName(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Loan Amount (₹) *</label>
                            <input
                                type="number"
                                placeholder="e.g., 100000"
                                value={principalAmount}
                                onChange={(e) => setPrincipalAmount(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Interest Rate (% per year)</label>
                            <input
                                type="number"
                                placeholder="e.g., 12"
                                value={interestRate}
                                onChange={(e) => setInterestRate(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Start Date *</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Interest Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as 'simple' | 'compound')}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm">
                                <option value="simple">Simple</option>
                                <option value="compound">Compound</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes (optional)</label>
                        <input
                            type="text"
                            placeholder="e.g., Tractor purchase loan"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors disabled:opacity-60">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Add Loan
                    </button>
                </form>
            </div>
        </div>
    );
}
