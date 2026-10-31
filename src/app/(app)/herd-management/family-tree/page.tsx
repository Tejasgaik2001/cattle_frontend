'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cowsApi } from '@/lib/api/cows';
import type { PedigreeNode } from '@/types';
import { TreeCanvas } from './components/TreeCanvas';
import { CattleDetailDialog } from './components/CattleDetailDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
    ArrowLeft, 
    Search, 
    RotateCcw, 
    Users, 
    Dna, 
    Sparkles, 
    Loader2, 
    AlertCircle, 
    HelpCircle,
    ChevronDown,
    Building2,
    Shield
} from 'lucide-react';

export default function FamilyTreePage() {
    const router = useRouter();
    const [nodes, setNodes] = useState<PedigreeNode[]>([]);
    const [rootId, setRootId] = useState<string>('');
    const [defaultRootId, setDefaultRootId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNodeForModal, setSelectedNodeForModal] = useState<PedigreeNode | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showLegend, setShowLegend] = useState(false);

    // Fetch pedigree data
    const fetchTreeData = useCallback(async (customRootId?: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await cowsApi.getFamilyTree(customRootId);
            setNodes(data);

            if (data && data.length > 0) {
                // If no root is currently selected or invalid, pick a smart default root
                // Priority: 1. A second-generation or calf with parents, 2. foundation parent with children, 3. first node
                const candidatesWithParentsAndChildren = data.filter(
                    (n) => n.parents && n.parents.length > 0 && n.children && n.children.length > 0
                );
                const candidatesWithChildren = data.filter(
                    (n) => n.children && n.children.length > 0
                );

                const bestRoot = candidatesWithParentsAndChildren[0] 
                    || candidatesWithChildren[0] 
                    || data[0];

                if (!customRootId) {
                    setRootId(bestRoot.id);
                    setDefaultRootId(bestRoot.id);
                } else {
                    setRootId(customRootId);
                }
            }
        } catch (err: any) {
            console.error('Failed to load family tree data:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load cattle family tree');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTreeData();
    }, [fetchTreeData]);

    // Search and filter suggestions
    const filteredSearchNodes = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase().trim();
        return nodes
            .filter((node) => {
                const tagMatch = node.tagNumber?.toLowerCase().includes(query);
                const nameMatch = node.name?.toLowerCase().includes(query);
                const regMatch = node.registrationNo?.toLowerCase().includes(query);
                const breedMatch = node.breed?.toLowerCase().includes(query);
                return tagMatch || nameMatch || regMatch || breedMatch;
            })
            .slice(0, 8);
    }, [nodes, searchQuery]);

    // Animals list for the root dropdown
    const availableRootOptions = useMemo(() => {
        return [...nodes].sort((a, b) => {
            // Put animals with calves first
            const aChildren = a.children?.length || 0;
            const bChildren = b.children?.length || 0;
            if (bChildren !== aChildren) return bChildren - aChildren;
            return (a.name || a.tagNumber).localeCompare(b.name || b.tagNumber);
        });
    }, [nodes]);

    // Counts for stat bar
    const stats = useMemo(() => {
        const total = nodes.length;
        const bulls = nodes.filter((n) => n.gender === 'male' && !n.isExternal).length;
        const cows = nodes.filter((n) => n.gender === 'female').length;
        const externalBulls = nodes.filter((n) => n.isExternal).length;
        const aiCalves = nodes.filter((n) => n.breedingMethod === 'AI').length;
        return { total, bulls, cows, externalBulls, aiCalves };
    }, [nodes]);

    const handleSelectRoot = (id: string) => {
        setRootId(id);
        setSearchQuery('');
    };

    const handleResetRoot = () => {
        if (defaultRootId) {
            setRootId(defaultRootId);
        } else if (nodes.length > 0) {
            setRootId(nodes[0].id);
        }
        setSearchQuery('');
    };

    const selectedRootNode = nodes.find((n) => n.id === rootId);

    return (
        <div className="space-y-4 max-w-[1600px] mx-auto pb-10">
            {/* Top Navigation & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/herd-management')}
                        className="h-9 w-9 p-0 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            Cattle Family Tree
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                Pedigree
                            </span>
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Trace sire & dam bloodlines, artificial insemination, and generation lineage
                        </p>
                    </div>
                </div>

                {/* Quick stats chips */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                    <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{stats.total} Total</span>
                    </div>

                    <div className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 shadow-sm flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300">
                        <span>♂ {stats.bulls} Bulls</span>
                    </div>

                    <div className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 shadow-sm flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300">
                        <span>♀ {stats.cows} Cows</span>
                    </div>

                    <div className="px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 shadow-sm flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300">
                        <Dna className="w-3.5 h-3.5 text-purple-600" />
                        <span>{stats.externalBulls} AI Sires</span>
                    </div>

                    {stats.aiCalves > 0 && (
                        <div className="px-2.5 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-800 shadow-sm flex items-center gap-1 font-bold text-purple-800 dark:text-purple-200">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>{stats.aiCalves} AI Calves</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Toolbar: Search, Root Switcher, Reset, Legend */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 flex-1 max-w-lg relative">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Search tag #, cow name, or bull reg..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs md:text-sm"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
                            >
                                ✕
                            </button>
                        )}

                        {/* Search dropdown suggestions */}
                        {filteredSearchNodes.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredSearchNodes.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => handleSelectRoot(item.id)}
                                        className="w-full text-left p-2.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${
                                                item.isExternal 
                                                    ? 'bg-purple-500' 
                                                    : item.gender === 'male' 
                                                        ? 'bg-blue-500' 
                                                        : 'bg-rose-500'
                                            }`} />
                                            <div>
                                                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                                                    {item.name} ({item.tagNumber || item.registrationNo})
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    {item.breed || 'Unknown breed'} • {item.isExternal ? 'AI Sire' : item.bornOnFarm ? 'Farm Born' : 'Purchased'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                            Focus
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Root Dropdown Selector */}
                    <div className="relative shrink-0">
                        <select
                            value={rootId}
                            onChange={(e) => handleSelectRoot(e.target.value)}
                            className="h-10 pl-3 pr-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none appearance-none cursor-pointer"
                        >
                            {availableRootOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                    {opt.isExternal ? '🧬 [AI] ' : opt.gender === 'male' ? '♂ ' : '♀ '}
                                    {opt.name} ({opt.tagNumber || opt.registrationNo})
                                    {opt.children?.length ? ` [${opt.children.length} calves]` : ''}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                    </div>
                </div>

                {/* Right utility buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResetRoot}
                        className="h-10 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        Reset Tree View
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowLegend(!showLegend)}
                        className="h-10 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                    >
                        <HelpCircle className="w-4 h-4 mr-1 text-slate-400" />
                        Legend
                    </Button>
                </div>
            </div>

            {/* Expandable Legend Section */}
            {showLegend && (
                <Card className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-blue-100 border-2 border-blue-500 flex items-center justify-center font-bold text-blue-700 text-xs">
                                ♂
                            </div>
                            <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">On-Farm Bull</span>
                                <span className="text-[11px] text-slate-500">Solid blue border & natural sire</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-rose-100 border-2 border-rose-400 flex items-center justify-center font-bold text-rose-700 text-xs">
                                ♀
                            </div>
                            <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">Cow / Dam</span>
                                <span className="text-[11px] text-slate-500">Solid pink/rose border & mother</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-purple-100 border-2 border-purple-500 border-dashed flex items-center justify-center font-bold text-purple-700 text-xs">
                                🧬
                            </div>
                            <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">AI Semen Bull</span>
                                <span className="text-[11px] text-slate-500">Purple dashed border (External sire)</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-slate-100 border-2 border-slate-400 border-dashed flex items-center justify-center font-bold text-slate-600 text-xs">
                                🏷️
                            </div>
                            <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">Purchased Animal</span>
                                <span className="text-[11px] text-slate-500">Dashed border; unknown root parents</span>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Active Root Banner */}
            {selectedRootNode && (
                <div className="px-4 py-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-900 dark:text-emerald-200">
                            Currently Focused Lineage:
                        </span>
                        <span className="font-black text-emerald-700 dark:text-emerald-300">
                            {selectedRootNode.name} ({selectedRootNode.tagNumber || selectedRootNode.registrationNo})
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 dark:text-slate-400">
                            {selectedRootNode.gender === 'male' ? 'Bull' : 'Cow'} • {selectedRootNode.breed || 'Cattle'}
                        </span>
                    </div>

                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedNodeForModal(selectedRootNode)}
                        className="h-6 text-xs text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-900 px-2"
                    >
                        View Full Profile
                    </Button>
                </div>
            )}

            {/* Tree Canvas or Loading/Error State */}
            {isLoading ? (
                <div className="w-full h-[620px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-9 h-9 text-emerald-600 animate-spin" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Calculating cattle pedigree tree...
                    </p>
                </div>
            ) : error ? (
                <div className="w-full h-[620px] rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-rose-500" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        Unable to load Family Tree
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md">{error}</p>
                    <Button
                        type="button"
                        onClick={() => fetchTreeData()}
                        className="mt-2 bg-emerald-600 text-white font-bold text-xs"
                    >
                        Retry Loading
                    </Button>
                </div>
            ) : nodes.length === 0 ? (
                <div className="w-full h-[620px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 p-6 text-center">
                    <Users className="w-10 h-10 text-slate-300" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        No Cattle Records Found
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md">
                        Add cows, bulls, or run the seed script to start visualizing family relationships.
                    </p>
                    <Button
                        type="button"
                        onClick={() => router.push('/herd-management')}
                        className="mt-2 bg-emerald-600 text-white font-bold text-xs"
                    >
                        Go to Herd Management
                    </Button>
                </div>
            ) : (
                <TreeCanvas
                    nodes={nodes}
                    rootId={rootId}
                    onSelectRoot={handleSelectRoot}
                    onViewDetails={(node) => setSelectedNodeForModal(node)}
                />
            )}

            {/* Quick Detail Dialog */}
            <CattleDetailDialog
                node={selectedNodeForModal}
                allNodes={nodes}
                isOpen={Boolean(selectedNodeForModal)}
                onClose={() => setSelectedNodeForModal(null)}
                onSelectRoot={handleSelectRoot}
            />
        </div>
    );
}
