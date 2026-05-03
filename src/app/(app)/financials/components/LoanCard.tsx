'use client';

import React, { useState } from 'react';
import { Building2, ChevronDown, ChevronUp, CreditCard, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import type { Loan } from '../types';
import { AddPaymentModal } from './AddPaymentModal';

interface LoanCardProps {
    loan: Loan;
    onUpdate: () => void;
}

function formatCurrency(n: number) {
    return `₹${Number(n).toLocaleString('en-IN')}`;
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function LoanCard({ loan, onUpdate }: LoanCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [paymentModal, setPaymentModal] = useState(false);

    const paidPercent = Math.min(
        100,
        Math.round((loan.totalPaid / loan.principalAmount) * 100),
    );

    const statusColor = loan.status === 'active'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';

    return (
        <>
            <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                {/* Main row */}
                <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40">
                                <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{loan.lenderName}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>
                                        {loan.status === 'active' ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                                        {loan.status === 'active' ? 'Active' : 'Closed'}
                                    </span>
                                    <span className="text-xs text-slate-400">{loan.interestRate}% {loan.type}</span>
                                    <span className="text-xs text-slate-400">since {formatDate(loan.startDate)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Outstanding</p>
                            <p className="text-xl font-black text-red-600 dark:text-red-400">{formatCurrency(loan.outstandingBalance)}</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                            <span>Paid: {formatCurrency(loan.totalPaid)}</span>
                            <span>Principal: {formatCurrency(loan.principalAmount)}</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                                style={{ width: `${paidPercent}%` }} />
                        </div>
                        <p className="text-xs text-right text-slate-400 mt-1">{paidPercent}% repaid</p>
                    </div>

                    {/* Accrued interest info */}
                    {loan.status === 'active' && (
                        <div className="mt-3 flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                Estimated interest accrued: <strong>{formatCurrency(Math.round(loan.accruedInterest))}</strong>
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                        {loan.status === 'active' && (
                            <button
                                onClick={() => setPaymentModal(true)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
                                <CreditCard className="h-4 w-4" />
                                Add Payment
                            </button>
                        )}
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors ml-auto">
                            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            {expanded ? 'Hide' : 'View'} History
                        </button>
                    </div>
                </div>

                {/* Payment history */}
                {expanded && (
                    <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-5">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Payment History</h4>
                        {loan.payments.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">No payments recorded yet</p>
                        ) : (
                            <div className="space-y-2">
                                {[...loan.payments].reverse().map((p) => (
                                    <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{formatDate(p.paymentDate)}</p>
                                            <p className="text-xs text-slate-400">
                                                Interest: {formatCurrency(Number(p.interestComponent))} •
                                                Principal: {formatCurrency(Number(p.principalComponent))}
                                                {p.notes && ` • ${p.notes}`}
                                            </p>
                                        </div>
                                        <p className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(Number(p.amountPaid))}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AddPaymentModal
                loan={loan}
                open={paymentModal}
                onClose={() => setPaymentModal(false)}
                onSuccess={onUpdate}
            />
        </>
    );
}
