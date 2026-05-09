'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, AlertTriangle, Loader2, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { reimbursementsApi } from '@/lib/api/reimbursements';
import type { SpendingByPerson, MemberDue } from '../types';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface ReimbursementsTabProps {
    farmId: string;
}

export function ReimbursementsTab({ farmId }: ReimbursementsTabProps) {
    const [pendingGroups, setPendingGroups] = useState<SpendingByPerson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [settlingId, setSettlingId] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingItem, setPendingItem] = useState<MemberDue | null>(null);

    const fetchDues = async () => {
        try {
            setIsLoading(true);
            const data = await reimbursementsApi.getPendingByPerson();
            setPendingGroups(data);
        } catch (error) {
            toast.error('Failed to load member dues');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDues();
    }, [farmId]);

    const handleSettleClick = (item: MemberDue) => {
        setPendingItem(item);
        setConfirmOpen(true);
    };

    const handleSettle = async () => {
        if (!pendingItem) return;
        
        try {
            setSettlingId(pendingItem.id);
            await reimbursementsApi.markAsPaid(pendingItem.id, {
                paidDate: new Date().toISOString().split('T')[0],
                note: 'Settled from dashboard',
            });
            toast.success('Debt settled successfully');
            fetchDues();
        } catch (error) {
            toast.error('Failed to settle debt');
        } finally {
            setSettlingId(null);
            setPendingItem(null);
        }
    };

    const formatCurrency = (n: number) => {
        const val = isNaN(n) ? 0 : n;
        return `₹${Math.abs(Number(val)).toLocaleString('en-IN')}`;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (pendingGroups.length === 0) {
        return (
            <div className="text-center py-16 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm">
                <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Pending Dues</h3>
                <p className="text-slate-500 dark:text-slate-400">All family and worker accounts are settled.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {pendingGroups.map((group) => (
                <div key={group.personId} className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                    {/* Person Header */}
                    <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-xl font-black shadow-lg">
                                {group.name[0]?.toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                    {group.name}
                                    <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest">
                                        {group.role}
                                    </span>
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Member Balance Account</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-6 md:gap-12 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200 dark:border-slate-700">
                            <div>
                                <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1">Business Owes Them</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(group.businessOwes)}</p>
                            </div>
                            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 hidden md:block" />
                            <div>
                                <p className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest mb-1">They Owe Business</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(group.owesBusiness)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Dues List */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {group.items.map((item) => (
                            <div key={item.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                                <div className="flex items-center gap-6">
                                    <div className={`p-3 rounded-2xl shadow-sm ${
                                        item.type === 'BUSINESS_OWES' 
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                        {item.type === 'BUSINESS_OWES' ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <p className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(item.amount)}</p>
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                item.type === 'BUSINESS_OWES' 
                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40' 
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40'
                                            }`}>
                                                {item.type === 'BUSINESS_OWES' ? 'Business Owes' : 'Member Owes'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {item.linkedTransaction ? new Date(item.linkedTransaction.date).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
                                            </div>
                                            {item.linkedTransaction && (
                                                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                    {item.linkedTransaction.category}
                                                </span>
                                            )}
                                            {(item.note || item.linkedTransaction?.description) && (
                                                <p className="truncate max-w-[200px] lg:max-w-md italic">
                                                    "{item.note || item.linkedTransaction?.description}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => handleSettleClick(item)}
                                    disabled={settlingId === item.id}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 shadow-sm ${
                                        item.type === 'BUSINESS_OWES'
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    } disabled:opacity-60`}
                                >
                                    {settlingId === item.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4" />
                                    )}
                                    {item.type === 'BUSINESS_OWES' ? 'Mark Paid' : 'Confirm Receipt'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <ConfirmationDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={pendingItem?.type === 'BUSINESS_OWES' ? 'Confirm Payment?' : 'Confirm Receipt?'}
                description={
                    pendingItem?.type === 'BUSINESS_OWES'
                        ? `Are you sure you have paid ₹${pendingItem.amount.toLocaleString('en-IN')} to ${pendingGroups.find(g => g.items.some(i => i.id === pendingItem.id))?.name}?`
                        : `Are you sure you have received ₹${pendingItem?.amount.toLocaleString('en-IN')} from ${pendingGroups.find(g => g.items.some(i => i.id === pendingItem?.id))?.name}?`
                }
                confirmText="Yes, Confirm"
                onConfirm={handleSettle}
            />
        </div>
    );
}
