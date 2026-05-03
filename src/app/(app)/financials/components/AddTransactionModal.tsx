'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { X, PlusCircle, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { financialApi } from '@/lib/api/financial';
import { peopleApi } from '@/lib/api/people';
import { cowsApi } from '@/lib/api/cows';
import { getFarmId } from '@/lib/farm';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, type Person } from '../types';

interface AddTransactionModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddTransactionModal({ open, onClose, onSuccess }: AddTransactionModalProps) {
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [paidById, setPaidById] = useState('');
    const [cowId, setCowId] = useState('');
    const [people, setPeople] = useState<Person[]>([]);
    const [cows, setCows] = useState<{ id: string; tagId: string; name: string | null }[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        Promise.all([peopleApi.getAll(), cowsApi.getActiveFemales()])
            .then(([p, c]) => {
                setPeople(p);
                setCows(c);
            })
            .catch(() => {});
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !amount || !date) {
            toast.error('Please fill in Category, Amount and Date');
            return;
        }

        try {
            setIsSaving(true);
            const farmId = await getFarmId();
            await financialApi.createTransaction(farmId, {
                type,
                category,
                amount: parseFloat(amount),
                date,
                description: description || undefined,
                paidById: paidById || undefined,
                cowId: cowId || undefined,
            });
            toast.success('Transaction saved!');
            onSuccess();
            onClose();
            // reset
            setCategory('');
            setAmount('');
            setDescription('');
            setPaidById('');
            setCowId('');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save transaction');
        } finally {
            setIsSaving(false);
        }
    };

    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
                            {type === 'income'
                                ? <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                : <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />}
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Log Transaction</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Type toggle */}
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        <button type="button"
                            onClick={() => { setType('expense'); setCategory(''); }}
                            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${type === 'expense' ? 'bg-red-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                            💸 Expense
                        </button>
                        <button type="button"
                            onClick={() => { setType('income'); setCategory(''); }}
                            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${type === 'income' ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                            💰 Income
                        </button>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category *</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm">
                            <option value="">Select category...</option>
                            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Amount + Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Amount (₹) *</label>
                            <input
                                type="number"
                                placeholder="e.g., 5000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date *</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm" />
                        </div>
                    </div>

                    {/* Paid By */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Paid By <span className="text-slate-400 font-normal">(for reimbursement tracking)</span>
                        </label>
                        <select
                            value={paidById}
                            onChange={(e) => setPaidById(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm">
                            <option value="">Not specified</option>
                            {people.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes (optional)</label>
                        <textarea
                            rows={2}
                            placeholder="e.g., Purchased 2 bags of feed from village market"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm resize-none" />
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-60">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                        Save Transaction
                    </button>
                </form>
            </div>
        </div>
    );
}
