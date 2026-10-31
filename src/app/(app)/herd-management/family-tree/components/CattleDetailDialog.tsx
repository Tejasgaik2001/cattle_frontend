'use client';

import React from 'react';
import type { PedigreeNode } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Calendar, 
    Dna, 
    Sparkles, 
    Building2, 
    Tag, 
    ArrowRight, 
    Heart, 
    Coins,
    FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CattleDetailDialogProps {
    node: PedigreeNode | null;
    allNodes: PedigreeNode[];
    isOpen: boolean;
    onClose: () => void;
    onSelectRoot: (id: string) => void;
}

export function CattleDetailDialog({
    node,
    allNodes,
    isOpen,
    onClose,
    onSelectRoot,
}: CattleDetailDialogProps) {
    const router = useRouter();
    if (!node) return null;

    const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

    const parents = (node.parents || [])
        .map((p) => nodeMap.get(p.id))
        .filter(Boolean) as PedigreeNode[];

    const children = (node.children || [])
        .map((c) => nodeMap.get(c.id))
        .filter(Boolean) as PedigreeNode[];

    const spouses = (node.spouses || [])
        .map((s) => nodeMap.get(s.id))
        .filter(Boolean) as PedigreeNode[];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md md:max-w-lg p-0 overflow-hidden rounded-2xl">
                {/* Header Strip */}
                <div className={`p-6 pb-4 ${
                    node.isExternal 
                        ? 'bg-purple-600 text-white' 
                        : node.gender === 'male' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-rose-600 text-white'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-0 font-bold uppercase tracking-wider text-[11px]">
                                {node.isExternal ? 'AI Semen Bull' : node.gender === 'male' ? 'Bull' : 'Cow'}
                            </Badge>

                            {node.breedingMethod && (
                                <Badge className="bg-black/20 text-white border-0 font-semibold text-[11px] flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    {node.breedingMethod}
                                </Badge>
                            )}
                        </div>

                        <span className="text-xs font-mono font-bold opacity-80">
                            ID: {node.tagNumber || node.registrationNo}
                        </span>
                    </div>

                    <div className="mt-3">
                        <h2 className="text-2xl font-black tracking-tight">{node.name || 'Unnamed Animal'}</h2>
                        <p className="text-sm opacity-90 font-medium">
                            {node.breed || 'Unknown breed'}
                        </p>
                    </div>
                </div>

                {/* Details Content */}
                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                    {/* Core details grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mb-1">
                                <Tag className="w-3.5 h-3.5" />
                                Tag / Reg No.
                            </span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                                {node.tagNumber || node.registrationNo || 'N/A'}
                            </span>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mb-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Date of Birth
                            </span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                                {node.dateOfBirth ? new Date(node.dateOfBirth).toLocaleDateString() : 'Unknown'}
                            </span>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mb-1">
                                <Building2 className="w-3.5 h-3.5" />
                                Origin / Source
                            </span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                                {node.isExternal ? (node.source || 'Semen Company') : node.bornOnFarm ? 'Born on Farm' : 'Purchased'}
                            </span>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mb-1">
                                <Coins className="w-3.5 h-3.5" />
                                Lifecycle Status
                            </span>
                            <span className="font-bold capitalize text-slate-900 dark:text-slate-100">
                                {node.status}
                            </span>
                        </div>
                    </div>

                    {/* Notes if any */}
                    {node.notes && (
                        <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/40 text-xs">
                            <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1 mb-1">
                                <FileText className="w-3.5 h-3.5" />
                                Bull Genetics & Notes
                            </span>
                            <p className="text-slate-700 dark:text-slate-300">{node.notes}</p>
                        </div>
                    )}

                    {/* Parents Section */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            Parents (Sire & Dam)
                        </h4>
                        {parents.length === 0 ? (
                            <p className="text-xs text-slate-500 italic p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                                {node.isExternal ? 'External bull record' : 'Unknown parents (Foundation or purchased animal)'}
                            </p>
                        ) : (
                            <div className="space-y-1.5">
                                {parents.map((parent) => (
                                    <div
                                        key={parent.id}
                                        className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${parent.gender === 'male' ? 'bg-blue-500' : 'bg-rose-500'}`} />
                                            <div>
                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                    {parent.name} ({parent.tagNumber || parent.registrationNo})
                                                </span>
                                                <span className="text-[11px] text-slate-400 block">
                                                    {parent.gender === 'male' ? 'Sire (Father)' : 'Dam (Mother)'} • {parent.breed}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                onSelectRoot(parent.id);
                                                onClose();
                                            }}
                                            className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                        >
                                            View Tree
                                            <ArrowRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Calves / Offspring Section */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Calves & Offspring ({children.length})</span>
                        </h4>
                        {children.length === 0 ? (
                            <p className="text-xs text-slate-500 italic p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                                No recorded calves for this animal.
                            </p>
                        ) : (
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                {children.map((child) => (
                                    <div
                                        key={child.id}
                                        className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${child.gender === 'male' ? 'bg-blue-500' : 'bg-rose-500'}`} />
                                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                                                {child.name} ({child.tagNumber})
                                            </span>
                                            {child.breedingMethod && (
                                                <span className="text-[10px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 font-semibold">
                                                    {child.breedingMethod}
                                                </span>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                onSelectRoot(child.id);
                                                onClose();
                                            }}
                                            className="h-6 text-[11px] text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-2"
                                        >
                                            Focus
                                            <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Buttons */}
                <DialogFooter className="p-4 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 sm:justify-between">
                    {!node.isExternal && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                onClose();
                                router.push(`/herd-management/${node.id}`);
                            }}
                            className="text-xs"
                        >
                            Open Herd Profile
                        </Button>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                                onSelectRoot(node.id);
                                onClose();
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                        >
                            Set as Tree Root
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
