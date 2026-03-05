'use client';

import React, { useState, useMemo } from 'react';
import { X, Baby, Loader2, Calendar } from 'lucide-react';
import type { CowHealthBreedingRow } from '@/lib/api/health-breeding';
import { healthBreedingApi } from '@/lib/api/health-breeding';

interface AddBreedingEventModalProps {
    cow: CowHealthBreedingRow | null;
    onClose: () => void;
    onSuccess: () => void;
}

type EventType = 'heat' | 'insemination' | 'pregnancy_confirmed';

const eventTypeLabels: Record<EventType, string> = {
    heat: '🌡 Heat Detection',
    insemination: '💉 Insemination',
    pregnancy_confirmed: '✅ Pregnancy Confirmed',
};

function addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

export function AddBreedingEventModal({ cow, onClose, onSuccess }: AddBreedingEventModalProps) {
    const today = new Date().toISOString().split('T')[0];
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        eventType: 'insemination' as EventType,
        inseminationDate: today,
        bullId: '',
        technicianName: '',
        notes: '',
    });

    const set = (field: keyof typeof form, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const expectedCalvingDate = useMemo(() => {
        if (form.eventType === 'pregnancy_confirmed' && form.inseminationDate) {
            return addDays(form.inseminationDate, 283);
        }
        return null;
    }, [form.eventType, form.inseminationDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cow) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await healthBreedingApi.createBreedingEvent({
                cowId: cow.id,
                eventType: form.eventType,
                inseminationDate: form.inseminationDate || undefined,
                bullId: form.bullId || undefined,
                technicianName: form.technicianName || undefined,
                notes: form.notes || undefined,
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Failed to save event. Please try again.');
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
                    <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-gradient-to-r from-violet-950/40 to-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                                <Baby className="h-5 w-5 text-violet-400" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-white">Add Breeding Event</h2>
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

                        {/* Event Type */}
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2">Event Type <span className="text-red-400">*</span></label>
                            <div className="grid grid-cols-3 gap-2">
                                {(Object.keys(eventTypeLabels) as EventType[]).map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => set('eventType', type)}
                                        className={`px-3 py-2.5 text-xs font-medium rounded-lg border transition-all text-center ${
                                            form.eventType === type
                                                ? 'bg-violet-600/30 border-violet-500 text-violet-300'
                                                : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-400'
                                        }`}
                                    >
                                        {eventTypeLabels[type]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                {form.eventType === 'heat' ? 'Heat Detection Date' : 'Insemination Date'} <span className="text-red-400">*</span>
                            </label>
                            <input
                                required
                                type="date"
                                value={form.inseminationDate}
                                onChange={e => set('inseminationDate', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                            />
                        </div>

                        {/* Expected Calving Date (auto-calculated banner) */}
                        {expectedCalvingDate && (
                            <div className="flex items-center gap-3 px-4 py-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                                <Calendar className="h-5 w-5 text-violet-400 shrink-0" />
                                <div>
                                    <p className="text-xs text-violet-400 font-medium">Expected Calving Date (auto-calculated)</p>
                                    <p className="text-sm font-bold text-white">
                                        {new Date(expectedCalvingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-slate-500">Insemination date + 283 days</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Bull / Semen ID</label>
                                <input
                                    type="text"
                                    value={form.bullId}
                                    onChange={e => set('bullId', e.target.value)}
                                    placeholder="e.g., HF-001"
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Technician Name</label>
                                <input
                                    type="text"
                                    value={form.technicianName}
                                    onChange={e => set('technicianName', e.target.value)}
                                    placeholder="e.g., Ramesh"
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes</label>
                            <textarea
                                rows={3}
                                value={form.notes}
                                onChange={e => set('notes', e.target.value)}
                                placeholder="Additional notes..."
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 resize-none"
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
                                className="flex-1 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Breeding Event'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
