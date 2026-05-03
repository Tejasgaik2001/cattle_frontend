'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { X, CreditCard, Loader2 } from 'lucide-react';
import { loansApi } from '@/lib/api/loans';
import type { Loan } from '../types';

interface AddPaymentModalProps {
    loan: Loan;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddPaymentModal({ loan, open, onClose, onSuccess }: AddPaymentModalProps) {
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [amountPaid, setAmountPaid] = useState('');
    const [interestComponent, setInterestComponent] = useState('');
    const [principalComponent, setPrincipalComponent] = useState('');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amountPaid || !paymentDate) {
            toast.error('Please fill in Amount and Date');
            return;
        }
        try {
            setIsSaving(true);
            await loansApi.addPayment(loan.id, {
                paymentDate,
                amountPaid: parseFloat(amountPaid),
                interestComponent: interestComponent ? parseFloat(interestComponent) : undefined,
                principalComponent: principalComponent ? parseFloat(principalComponent) : undefined,
                notes: notes || undefined,
            });
            toast.success('Payment recorded!');
            onSuccess();
            onClose();
            setAmountPaid('');
            setInterestComponent('');
            setPrincipalComponent('');
            setNotes('');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to record payment');
        } finally {
            setIsSaving(false);
        }
    };

    const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40">
                            <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Record Payment</h2>
                            <p className="text-xs text-slate-500">{loan.lenderName} • Outstanding: {formatCurrency(loan.outstandingBalance)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Payment Date *</label>
                            <input
                                type="date"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Total Amount Paid (₹) *</label>
                            <input
                                type="number"
                                placeholder="e.g., 5000"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                        </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                        💡 <strong>Optional:</strong> If you know the breakdown, fill interest and principal below. Otherwise, we'll auto-calculate.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Interest Portion (₹)</label>
                            <input
                                type="number"
                                placeholder="Auto"
                                value={interestComponent}
                                onChange={(e) => setInterestComponent(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Principal Portion (₹)</label>
                            <input
                                type="number"
                                placeholder="Auto"
                                value={principalComponent}
                                onChange={(e) => setPrincipalComponent(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes (optional)</label>
                        <input
                            type="text"
                            placeholder="e.g., March EMI"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-60">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Record Payment
                    </button>
                </form>
            </div>
        </div>
    );
}
