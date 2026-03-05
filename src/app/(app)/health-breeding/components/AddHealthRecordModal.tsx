'use client';

import React, { useState } from 'react';
import { X, Stethoscope, Loader2 } from 'lucide-react';
import type { CowHealthBreedingRow } from '@/lib/api/health-breeding';
import { healthBreedingApi } from '@/lib/api/health-breeding';

interface AddHealthRecordModalProps {
    cow: CowHealthBreedingRow | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddHealthRecordModal({ cow, onClose, onSuccess }: AddHealthRecordModalProps) {
    const today = new Date().toISOString().split('T')[0];
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        issue: '',
        treatmentType: '',
        medication: '',
        withdrawalDays: '',
        vetName: '',
        notes: '',
        treatmentDate: today,
    });

    const set = (field: keyof typeof form, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cow) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await healthBreedingApi.createHealthRecord({
                cowId: cow.id,
                issue: form.issue,
                treatmentType: form.treatmentType || undefined,
                medication: form.medication || undefined,
                withdrawalDays: form.withdrawalDays ? Number(form.withdrawalDays) : undefined,
                vetName: form.vetName || undefined,
                notes: form.notes || undefined,
                treatmentDate: form.treatmentDate,
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Failed to save record. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!cow) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-gradient-to-r from-red-950/40 to-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                                <Stethoscope className="h-5 w-5 text-red-400" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-white">Add Health Record</h2>
                                <p className="text-xs text-slate-400">
                                    Cow: <span className="text-emerald-400 font-mono">{cow.tagId}</span>
                                    {cow.name && ` / ${cow.name}`}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
                        {error && (
                            <div className="px-4 py-3 bg-red-900/30 border border-red-700/50 text-red-300 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Health Issue / Diagnosis <span className="text-red-400">*</span></label>
                            <input
                                required
                                type="text"
                                value={form.issue}
                                onChange={e => set('issue', e.target.value)}
                                placeholder="e.g., Mastitis, Foot rot, Fever"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Treatment Type</label>
                                <input
                                    type="text"
                                    value={form.treatmentType}
                                    onChange={e => set('treatmentType', e.target.value)}
                                    placeholder="e.g., Antibiotic"
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Medication</label>
                                <input
                                    type="text"
                                    value={form.medication}
                                    onChange={e => set('medication', e.target.value)}
                                    placeholder="e.g., Penicillin"
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Withdrawal Days</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.withdrawalDays}
                                    onChange={e => set('withdrawalDays', e.target.value)}
                                    placeholder="e.g., 7"
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                                />
                                {form.withdrawalDays && (
                                    <p className="text-xs text-amber-400 mt-1">⚠ Milk will be marked unsellable for {form.withdrawalDays} days</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Vet Name</label>
                                <input
                                    type="text"
                                    value={form.vetName}
                                    onChange={e => set('vetName', e.target.value)}
                                    placeholder="e.g., Dr. Sharma"
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Treatment Date <span className="text-red-400">*</span></label>
                            <input
                                required
                                type="date"
                                value={form.treatmentDate}
                                onChange={e => set('treatmentDate', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes</label>
                            <textarea
                                rows={3}
                                value={form.notes}
                                onChange={e => set('notes', e.target.value)}
                                placeholder="Additional notes..."
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 resize-none"
                            />
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Health Record'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
