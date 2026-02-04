"use client"

import React, { useState, useMemo } from 'react';
import type { Cow } from '@/types';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, ChevronRight } from 'lucide-react';

interface HerdListProps {
    cows: Cow[];
    onAddCow: () => void;
    onViewCowDetails: (cowId: string) => void;
    isLoading?: boolean;
}

export function HerdList({ cows, onAddCow, onViewCowDetails, isLoading = false }: HerdListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'sold' | 'deceased'>('all');

    const filteredCows = useMemo(() => {
        return cows.filter(cow => {
            const matchesSearch = cow.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (cow.name && cow.name.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = filterStatus === 'all' || cow.lifecycleStatus === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [cows, searchTerm, filterStatus]);

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'sold': return 'warning';
            case 'deceased': return 'secondary';
            default: return 'default';
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 space-y-6">
                <div className="flex items-center justify-center h-64">
                    <p className="text-slate-500 dark:text-slate-400">Loading herd...</p>
                </div>
            </div>
        );
    }

    // Empty state
    if (cows.length === 0) {
        return (
            <div className="p-4 md:p-6 space-y-6">
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <p className="text-lg text-slate-500 dark:text-slate-400">No cows in your herd yet.</p>
                    <Button onClick={onAddCow} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Add Your First Cow
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header and Add Cow Button */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Herd</h2>
                <Button onClick={onAddCow} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Add New Cow
                </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Search by Tag ID or Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-slate-800/50 rounded-lg shadow-sm overflow-hidden">
                <Table className="w-full font-sans">
                    <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-900/60 border-b-slate-200 dark:border-b-slate-700">
                            <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tag ID</TableHead>
                            <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</TableHead>
                            <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Breed</TableHead>
                            <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gender</TableHead>
                            <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</TableHead>
                            <TableHead className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredCows.map((cow) => (
                            <TableRow
                                key={cow.id}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                                onClick={() => onViewCowDetails(cow.id)}
                            >
                                <TableCell className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{cow.tagId}</TableCell>
                                <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">{cow.name || '-'}</TableCell>
                                <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">{cow.breed}</TableCell>
                                <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300 capitalize">{cow.gender}</TableCell>
                                <TableCell className="px-4 py-4 whitespace-nowrap text-sm">
                                    <Badge variant={getStatusBadgeVariant(cow.lifecycleStatus)}>
                                        {cow.lifecycleStatus.charAt(0).toUpperCase() + cow.lifecycleStatus.slice(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onViewCowDetails(cow.id);
                                        }}
                                        className="text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    >
                                        View <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredCows.map((cow) => (
                    <Card
                        key={cow.id}
                        className="bg-white dark:bg-slate-800/50 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
                        onClick={() => onViewCowDetails(cow.id)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{cow.name || 'Untitled Cow'}</h3>
                                <Badge variant={getStatusBadgeVariant(cow.lifecycleStatus)}>
                                    {cow.lifecycleStatus.charAt(0).toUpperCase() + cow.lifecycleStatus.slice(1)}
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Tag ID: {cow.tagId}</p>
                            <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400 mt-2">
                                <span>{cow.breed}</span>
                                <span className="capitalize">{cow.gender}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* No results message */}
            {filteredCows.length === 0 && cows.length > 0 && (
                <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">No cows match your search criteria.</p>
                </div>
            )}
        </div>
    );
}
