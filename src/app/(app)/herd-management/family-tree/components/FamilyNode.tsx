'use client';

import React from 'react';
import type { ExtNode } from 'relatives-tree/lib/types';
import type { PedigreeNode } from '@/types';
import { 
    Dna, 
    Sparkles, 
    Info, 
    Calendar, 
    Building2,
    CheckCircle2
} from 'lucide-react';

export type PedigreeExtNode = PedigreeNode & {
    top: number;
    left: number;
    hasSubTree: boolean;
};

interface FamilyNodeProps {
    node: PedigreeExtNode;
    isRoot: boolean;
    onSelectRoot: (id: string) => void;
    onViewDetails: (node: PedigreeNode) => void;
    style: React.CSSProperties;
}

export const FamilyNode = React.memo(function FamilyNode({
    node,
    isRoot,
    onSelectRoot,
    onViewDetails,
    style,
}: FamilyNodeProps) {
    const isExternal = Boolean(node.isExternal);
    const isMale = node.gender === 'male';
    const isFemale = node.gender === 'female';
    const isPurchased = !node.bornOnFarm && !isExternal;
    const isInactive = node.status === 'sold' || node.status === 'deceased';

    // Theme calculation
    let borderColor = 'border-slate-300 dark:border-slate-700';
    let bgColor = 'bg-white dark:bg-slate-900';
    let headerBg = 'bg-slate-50 dark:bg-slate-800/80';
    let textColor = 'text-slate-900 dark:text-slate-100';

    if (isExternal) {
        // AI / Semen bull: purple dashed
        borderColor = 'border-purple-500 dark:border-purple-400 border-dashed';
        bgColor = 'bg-purple-50/70 dark:bg-purple-950/40';
        headerBg = 'bg-purple-100/80 dark:bg-purple-900/40 text-purple-900 dark:text-purple-200';
    } else if (isMale) {
        // Bull: blue
        borderColor = isPurchased ? 'border-blue-500 border-dashed' : 'border-blue-500 dark:border-blue-600';
        bgColor = 'bg-blue-50/60 dark:bg-blue-950/30';
        headerBg = 'bg-blue-100/70 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200';
    } else if (isFemale) {
        // Cow: pink/rose
        borderColor = isPurchased ? 'border-rose-400 border-dashed' : 'border-rose-400 dark:border-rose-600';
        bgColor = 'bg-rose-50/60 dark:bg-rose-950/30';
        headerBg = 'bg-rose-100/70 dark:bg-rose-900/40 text-rose-900 dark:text-rose-200';
    }

    if (isInactive) {
        bgColor = 'bg-slate-100/80 dark:bg-slate-800/60 opacity-70';
        borderColor = 'border-slate-400 dark:border-slate-600';
    }

    const rootClasses = isRoot 
        ? 'ring-4 ring-emerald-500 dark:ring-emerald-400 shadow-xl shadow-emerald-500/20 z-20' 
        : 'hover:shadow-lg transition-all hover:-translate-y-0.5 z-10';

    return (
        <div
            style={style}
            className="p-2.5 box-border select-none"
        >
            <div
                onClick={() => onSelectRoot(node.id)}
                className={`w-full h-full rounded-xl border-2 ${borderColor} ${bgColor} ${rootClasses} flex flex-col justify-between overflow-hidden cursor-pointer backdrop-blur-sm transition-all duration-200 group relative shadow-sm`}
            >
                {/* Top Header Strip */}
                <div className={`px-2.5 py-1 ${headerBg} flex items-center justify-between border-b border-black/5 dark:border-white/5`}>
                    <div className="flex items-center gap-1.5 min-w-0">
                        {isExternal ? (
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                                <Dna className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                                AI Bull
                            </span>
                        ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {isMale ? '♂ Bull' : '♀ Cow'}
                            </span>
                        )}

                        <span className="font-extrabold text-xs tracking-tight truncate max-w-[95px] text-slate-800 dark:text-slate-100">
                            {node.tagNumber || node.registrationNo || node.id}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        {isRoot && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-bold bg-emerald-600 text-white rounded-full">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Root
                            </span>
                        )}

                        <button
                            type="button"
                            title="View Cattle Details"
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails(node);
                            }}
                            className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                            <Info className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="px-2.5 py-1.5 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {node.name || 'Unnamed'}
                        </span>
                        {node.breed && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[80px]">
                                {node.breed}
                            </span>
                        )}
                    </div>

                    {isExternal ? (
                        <div className="text-[11px] text-purple-700 dark:text-purple-300 flex items-center gap-1 mt-0.5 truncate">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{node.source || 'Semen Straw'}</span>
                        </div>
                    ) : (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 shrink-0 text-slate-400" />
                            <span className="font-medium">
                                {node.dateOfBirth 
                                    ? `DOB: ${new Date(node.dateOfBirth).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}` 
                                    : 'DOB: Unknown'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Bottom Badges Strip */}
                <div className="px-2 py-1 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-1 text-[9px]">
                    <div className="flex items-center gap-1 flex-wrap">
                        {/* Origin Badge */}
                        {isExternal ? (
                            <span className="px-1.5 py-0.5 rounded font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                                Straw Sire
                            </span>
                        ) : node.bornOnFarm ? (
                            <span className="px-1.5 py-0.5 rounded font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                Farm Born
                            </span>
                        ) : (
                            <span className="px-1.5 py-0.5 rounded font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700 border-dashed">
                                Purchased
                            </span>
                        )}

                        {/* Breeding Method Badge */}
                        {node.breedingMethod === 'AI' ? (
                            <span className="px-1.5 py-0.5 rounded font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                                AI
                            </span>
                        ) : node.breedingMethod === 'NATURAL' ? (
                            <span className="px-1.5 py-0.5 rounded font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                                Natural
                            </span>
                        ) : null}

                        {/* Inactive status */}
                        {isInactive && (
                            <span className="px-1 py-0.5 rounded font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                {node.status}
                            </span>
                        )}
                    </div>

                    {/* Children count if any */}
                    {node.children && node.children.length > 0 && (
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                            {node.children.length} {node.children.length === 1 ? 'calf' : 'calves'}
                        </span>
                    )}
                </div>

                {/* Subtree indicator badge on top right corner */}
                {node.hasSubTree && (
                    <div 
                        title="Has further ancestry/subtree"
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow ring-2 ring-white dark:ring-slate-900"
                    >
                        +
                    </div>
                )}
            </div>
        </div>
    );
});
