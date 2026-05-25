'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, Calendar, ArrowUpRight, ArrowDownLeft, Plus, RefreshCw, Download } from 'lucide-react';
import { reimbursementsApi } from '@/lib/api/reimbursements';
import { financialApi } from '@/lib/api/financial';
import { usersApi, type User } from '@/lib/api/users';
import type { SpendingByPerson, MemberDue } from '../types';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import * as XLSX from 'xlsx';

interface ReimbursementsTabProps {
    farmId: string;
}

export function ReimbursementsTab({ farmId }: ReimbursementsTabProps) {
    const [pendingGroups, setPendingGroups] = useState<SpendingByPerson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [settlingId, setSettlingId] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingItem, setPendingItem] = useState<MemberDue | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<string>('');
    const [displayPaymentAmount, setDisplayPaymentAmount] = useState<string>('');
    const [isPartialPayment, setIsPartialPayment] = useState(false);
    const [lendDialogOpen, setLendDialogOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [lendForm, setLendForm] = useState({
        personId: '',
        amount: '',
        displayAmount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [exportDateRange, setExportDateRange] = useState({
        from: '',
        to: '',
    });

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

    const fetchUsers = async () => {
        try {
            const data = await usersApi.getAll();
            setUsers(data);
        } catch (error) {
            toast.error('Failed to load users');
        }
    };

    const formatIndianCurrency = (value: string): string => {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (!numericValue) return '';
        const num = parseInt(numericValue, 10);
        return num.toLocaleString('en-IN');
    };

    const handleLendAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const numericValue = inputValue.replace(/[^0-9]/g, '');
        setLendForm({ ...lendForm, amount: numericValue, displayAmount: formatIndianCurrency(numericValue) });
    };

    const handlePaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const numericValue = inputValue.replace(/[^0-9]/g, '');
        setPaymentAmount(numericValue);
        setDisplayPaymentAmount(formatIndianCurrency(numericValue));
    };

    useEffect(() => {
        fetchDues();
        fetchUsers();
    }, [farmId]);

    const handleSettleClick = (item: MemberDue) => {
        setPendingItem(item);
        setPaymentAmount('');
        setDisplayPaymentAmount('');
        setIsPartialPayment(false);
        setConfirmOpen(true);
    };

    const handleSettle = async () => {
        if (!pendingItem) return;
        
        try {
            setSettlingId(pendingItem.id);
            
            const payload: any = {
                paidDate: new Date().toISOString().split('T')[0],
                note: isPartialPayment ? 'Partial payment' : 'Settled from dashboard',
            };
            
            if (isPartialPayment && paymentAmount) {
                payload.amount = parseFloat(paymentAmount);
            }
            
            await reimbursementsApi.markAsPaid(pendingItem.id, payload);
            toast.success(isPartialPayment ? 'Partial payment recorded successfully' : 'Debt settled successfully');
            fetchDues();
        } catch (error) {
            toast.error('Failed to settle debt');
        } finally {
            setSettlingId(null);
            setPendingItem(null);
            setPaymentAmount('');
            setIsPartialPayment(false);
        }
    };

    const formatCurrency = (n: number) => {
        const val = isNaN(n) ? 0 : n;
        return `₹${Math.abs(Number(val)).toLocaleString('en-IN')}`;
    };

    const handleExportToExcel = () => {
        try {
            const exportData: any[] = [];
            
            pendingGroups.forEach(group => {
                group.items.forEach(item => {
                    const itemDate = item.linkedTransaction 
                        ? new Date(item.linkedTransaction.date)
                        : new Date(item.createdAt);
                    
                    // Filter by date range if provided
                    if (exportDateRange.from && new Date(exportDateRange.from) > itemDate) return;
                    if (exportDateRange.to && new Date(exportDateRange.to) < itemDate) return;

                    const remainingAmount = item.amount - (item.paidAmount || 0);
                    exportData.push({
                        'Person Name': group.name,
                        'Type': item.type === 'BUSINESS_OWES' ? 'Business Owes' : 'Member Owes Business',
                        'Total Amount': item.amount,
                        'Paid Amount': item.paidAmount || 0,
                        'Remaining Amount': remainingAmount,
                        'Status': item.status,
                        'Date': item.linkedTransaction 
                            ? new Date(item.linkedTransaction.date).toLocaleDateString()
                            : new Date(item.createdAt).toLocaleDateString(),
                        'Category': item.linkedTransaction?.category || 'N/A',
                        'Description': item.note || item.linkedTransaction?.description || 'N/A',
                        'Settled At': item.settledAt ? new Date(item.settledAt).toLocaleDateString() : 'Not Settled',
                    });
                });
            });

            if (exportData.length === 0) {
                toast.error('No data to export for the selected date range');
                return;
            }

            // Convert to Excel
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Member Dues');
            
            const fileName = `member-dues-${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
            toast.success('Exported to Excel successfully');
        } catch (error) {
            toast.error('Failed to export to Excel');
        }
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
            {/* Refresh Button at Top */}
            <div className="flex justify-end">
                <Button onClick={() => { fetchDues(); fetchUsers(); }} variant="outline" className="border-slate-300 dark:border-slate-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Header with Lend Money and Export Buttons */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Member Dues</h2>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Label htmlFor="exportFrom" className="text-xs">From:</Label>
                        <Input
                            id="exportFrom"
                            type="date"
                            value={exportDateRange.from}
                            onChange={(e) => setExportDateRange({ ...exportDateRange, from: e.target.value })}
                            className="w-32 h-8 text-sm"
                        />
                        <Label htmlFor="exportTo" className="text-xs">To:</Label>
                        <Input
                            id="exportTo"
                            type="date"
                            value={exportDateRange.to}
                            onChange={(e) => setExportDateRange({ ...exportDateRange, to: e.target.value })}
                            className="w-32 h-8 text-sm"
                        />
                    </div>
                    <Button onClick={handleExportToExcel} variant="outline" className="border-slate-300 dark:border-slate-700">
                        <Download className="h-4 w-4 mr-2" />
                        Export Excel
                    </Button>
                    <Button onClick={() => setLendDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Lend Money
                    </Button>
                </div>
            </div>

            {pendingGroups.map((group) => {
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedItems = group.items.slice(startIndex, endIndex);
                const totalPages = Math.ceil(group.items.length / itemsPerPage);

                return (
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
                            {paginatedItems.map((item) => {
                            const remainingAmount = item.amount - (item.paidAmount || 0);
                            const isPartiallyPaid = item.status === 'PARTIALLY_PAID';
                            
                            return (
                                <div key={item.id} className="px-8 py-5 flex items-center justify-between transition-colors">
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
                                                <p className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(remainingAmount)}</p>
                                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                    item.type === 'BUSINESS_OWES' 
                                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40' 
                                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40'
                                                }`}>
                                                    {item.type === 'BUSINESS_OWES' ? 'Business Owes' : 'Member Owes'}
                                                </span>
                                                {isPartiallyPaid && (
                                                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-violet-100 text-violet-700 dark:bg-violet-900/40">
                                                        Partially Paid
                                                    </span>
                                                )}
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
                                                {isPartiallyPaid && (
                                                    <span className="text-violet-600 dark:text-violet-400">
                                                        Paid: {formatCurrency(item.paidAmount || 0)} / Total: {formatCurrency(item.amount)}
                                                    </span>
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
                                        {isPartiallyPaid ? 'Pay More' : (item.type === 'BUSINESS_OWES' ? 'Mark Paid' : 'Confirm Receipt')}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {group.items.length > itemsPerPage && (
                        <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Showing {startIndex + 1}-{Math.min(endIndex, group.items.length)} of {group.items.length} items
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
                </div>
                );
            })}

            <ConfirmationDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={pendingItem?.type === 'BUSINESS_OWES' ? 'Confirm Payment?' : 'Confirm Receipt?'}
                description={
                    <div className="space-y-4">
                        <p>
                            {pendingItem?.type === 'BUSINESS_OWES'
                                ? `Are you sure you have paid to ${pendingGroups.find(g => g.items.some(i => i.id === pendingItem.id))?.name}?`
                                : `Are you sure you have received from ${pendingGroups.find(g => g.items.some(i => i.id === pendingItem?.id))?.name}?`
                            }
                        </p>
                        
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="partialPayment"
                                checked={isPartialPayment}
                                onChange={(e) => setIsPartialPayment(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <label htmlFor="partialPayment" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Pay partial amount
                            </label>
                        </div>

                        {isPartialPayment && (
                            <div className="space-y-2">
                                <Label htmlFor="paymentAmount">Payment Amount (₹)</Label>
                                <Input
                                    id="paymentAmount"
                                    type="text"
                                    value={displayPaymentAmount}
                                    onChange={handlePaymentAmountChange}
                                    placeholder="e.g., 5,000"
                                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Total due: ₹{pendingItem?.amount?.toLocaleString('en-IN')}
                                </p>
                            </div>
                        )}
                    </div>
                }
                confirmText={isPartialPayment ? 'Record Partial Payment' : 'Yes, Confirm'}
                onConfirm={handleSettle}
            />

            {/* Lend Money Dialog */}
            <Dialog open={lendDialogOpen} onOpenChange={setLendDialogOpen}>
                <DialogContent className="bg-white dark:bg-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 dark:text-white">Lend Money to Person</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="personId">Person</Label>
                            <select
                                id="personId"
                                value={lendForm.personId}
                                onChange={(e) => setLendForm({ ...lendForm, personId: e.target.value })}
                                className="w-full mt-1.5 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
                            >
                                <option value="">Select a user</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.globalRole.replace('_', ' ')})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="amount">Amount (₹)</Label>
                            <Input
                                id="amount"
                                type="text"
                                value={lendForm.displayAmount}
                                onChange={handleLendAmountChange}
                                placeholder="e.g., 10,000"
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={lendForm.date}
                                onChange={(e) => setLendForm({ ...lendForm, date: e.target.value })}
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description (optional)</Label>
                            <Input
                                id="description"
                                value={lendForm.description}
                                onChange={(e) => setLendForm({ ...lendForm, description: e.target.value })}
                                placeholder="Enter description"
                                className="mt-1.5"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLendDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={async () => {
                                if (!lendForm.personId || !lendForm.amount) {
                                    toast.error('Please fill all required fields');
                                    return;
                                }

                                try {
                                    await financialApi.createTransaction(farmId, {
                                        type: 'expense',
                                        category: 'Loan to Person',
                                        amount: parseFloat(lendForm.amount),
                                        date: lendForm.date,
                                        description: lendForm.description || 'Money lent to person',
                                        paidById: lendForm.personId,
                                    });
                                    toast.success('Money lent successfully');
                                    setLendDialogOpen(false);
                                    setLendForm({
                                        personId: '',
                                        amount: '',
                                        displayAmount: '',
                                        date: new Date().toISOString().split('T')[0],
                                        description: '',
                                    });
                                    fetchDues();
                                } catch (error) {
                                    toast.error('Failed to lend money');
                                }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Lend Money
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
