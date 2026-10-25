'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { UserPlus, Trash2, Users, Loader2 } from 'lucide-react';
import { peopleApi } from '@/lib/api/people';
import type { Person } from '../types';

interface PeopleManagerProps {
    people: Person[];
    onUpdate: () => void;
}

const roleColors: Record<string, string> = {
    owner: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
    family: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    worker: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export function PeopleManager({ people, onUpdate }: PeopleManagerProps) {
    const [name, setName] = useState('');
    const [role, setRole] = useState<'owner' | 'family' | 'worker'>('worker');
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        try {
            setIsSaving(true);
            await peopleApi.create({ name: name.trim(), role });
            toast.success(`${name} added!`);
            setName('');
            onUpdate();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add person');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (person: Person) => {
        if (person.role === 'owner') {
            toast.error('Cannot delete the Owner');
            return;
        }
        setDeletingId(person.id);
        try {
            await peopleApi.delete(person.id);
            toast.success(`${person.name} removed`);
            onUpdate();
        } catch (err: any) {
            toast.error('Failed to remove person');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Add new person */}
            <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <UserPlus className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <h3 className="font-bold text-slate-900 dark:text-white">Add New Person</h3>
                </div>
                <form onSubmit={handleAdd} className="flex gap-3 flex-wrap">
                    <input
                        type="text"
                        placeholder="Name (e.g., Tejas)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1 min-w-[160px] px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm">
                        <option value="worker">Worker</option>
                        <option value="family">Family</option>
                        <option value="owner">Owner</option>
                    </select>
                    <button
                        type="submit"
                        disabled={isSaving || !name.trim()}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                        Add
                    </button>
                </form>
            </div>

            {/* People list */}
            <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <h3 className="font-bold text-slate-900 dark:text-white">People ({people.length})</h3>
                </div>
                {people.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">No people added yet. Add people above to track who pays expenses.</p>
                ) : (
                    <div className="space-y-2">
                        {people.map((p) => (
                            <div key={p.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-900/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                                        {p.name[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{p.name}</p>
                                        {p.notes && <p className="text-xs text-slate-400">{p.notes}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${roleColors[p.role] || ''}`}>
                                        {p.role}
                                    </span>
                                    {p.role !== 'owner' && (
                                        <button
                                            onClick={() => handleDelete(p)}
                                            disabled={deletingId === p.id}
                                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                            {deletingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
