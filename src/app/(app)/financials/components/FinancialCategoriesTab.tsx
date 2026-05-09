'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Settings, AlertCircle, Loader2 } from 'lucide-react';
import { financialCategoriesApi, FinancialCategory } from '@/lib/api/financialCategories';

export function FinancialCategoriesTab() {
    const [categories, setCategories] = useState<FinancialCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    // New Category Form
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<'income' | 'expense'>('expense');

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const data = await financialCategoriesApi.getAll();
            setCategories(data);
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        try {
            setIsAdding(true);
            await financialCategoriesApi.create(newName.trim(), newType);
            toast.success('Category added');
            setNewName('');
            fetchCategories();
        } catch (error) {
            toast.error('Failed to add category');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        
        try {
            await financialCategoriesApi.remove(id);
            toast.success('Category deleted');
            fetchCategories();
        } catch (error) {
            toast.error('Cannot delete system category or category in use');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Add Category Section */}
            <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-emerald-600" />
                    Add New Category
                </h3>
                <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="e.g., Solar Maintenance, Calf Starter"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                            required
                        />
                    </div>
                    <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setNewType('expense')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${newType === 'expense' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            Expense
                        </button>
                        <button
                            type="button"
                            onClick={() => setNewType('income')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${newType === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            Income
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={isAdding}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                        {isAdding ? 'Adding...' : 'Add Category'}
                    </button>
                </form>
            </div>

            {/* List Categories Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Expense Categories */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                        Expense Categories
                    </h4>
                    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-3xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                        {categories.filter(c => c.type === 'expense').map((cat) => (
                            <div key={cat.id} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{cat.name}</span>
                                <div className="flex items-center gap-2">
                                    {cat.isSystem ? (
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System</span>
                                    ) : (
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Income Categories */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
                        <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                        Income Categories
                    </h4>
                    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-3xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                        {categories.filter(c => c.type === 'income').map((cat) => (
                            <div key={cat.id} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{cat.name}</span>
                                <div className="flex items-center gap-2">
                                    {cat.isSystem ? (
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System</span>
                                    ) : (
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Note about system categories */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <AlertCircle className="h-5 w-5 text-slate-400 shrink-0" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    <strong>Note:</strong> System categories (marked as System) are required for core app features like milk sales tracking and cannot be deleted. You can add as many custom categories as you need.
                </p>
            </div>
        </div>
    );
}

function ArrowUpRight(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
}

function ArrowDownLeft(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 17H7V7"/><path d="M17 7 7 17"/></svg>
}
