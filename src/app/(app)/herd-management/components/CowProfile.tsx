"use client"

import React from 'react';
import type { Cow, CowEvent, MilkRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft, Edit, PlusCircle, Milk, Calendar,
    Droplets, Stethoscope, Baby, PiggyBank, Tag, UsersRound
} from 'lucide-react';
import { format } from 'date-fns';

interface CowProfileProps {
    cow: Cow;
    cowEvents: CowEvent[];
    latestMilkRecord?: MilkRecord;
    onEditCow: (cowId: string) => void;
    onAddCowEvent: (cowId: string) => void;
    onRecordMilkForCow: (cowId: string) => void;
    onMarkCowLifecycleStatus: (cowId: string, status: 'active' | 'sold' | 'deceased') => void;
    onBackToHerdList: () => void;
    isLoading?: boolean;
}

// Helper to format dates
const formatDate = (dateString: string) => {
    try {
        return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
        return dateString;
    }
};

// Helper to get event icon
const getEventIcon = (eventType: CowEvent['type']) => {
    switch (eventType) {
        case 'HEALTH': return <Stethoscope className="h-4 w-4 text-red-500" />;
        case 'VACCINATION': return <Droplets className="h-4 w-4 text-blue-500" />;
        case 'BREEDING': return <Baby className="h-4 w-4 text-pink-500" />;
        case 'FINANCIAL': return <PiggyBank className="h-4 w-4 text-emerald-500" />;
        case 'NOTE': return <Tag className="h-4 w-4 text-slate-500" />;
        default: return <Tag className="h-4 w-4 text-slate-500" />;
    }
};

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'active': return 'success';
        case 'sold': return 'warning';
        case 'deceased': return 'secondary';
        default: return 'default';
    }
};

export function CowProfile({
    cow,
    cowEvents,
    latestMilkRecord,
    onEditCow,
    onAddCowEvent,
    onRecordMilkForCow,
    onMarkCowLifecycleStatus,
    onBackToHerdList,
    isLoading = false,
}: CowProfileProps) {
    // Sort events by date descending for chronological timeline
    const sortedEvents = [...cowEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-center h-64">
                    <p className="text-slate-500 dark:text-slate-400">Loading cow profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
            {/* Back to Herd List */}
            <Button variant="ghost" onClick={onBackToHerdList} className="text-slate-700 dark:text-slate-300">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Herd
            </Button>

            {/* Top Identity Section */}
            <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                            {cow.name || 'Untitled Cow'}
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-300">
                            Tag ID: {cow.tagId}
                        </p>
                        <Badge variant={getStatusBadgeVariant(cow.lifecycleStatus)}>
                            Status: {cow.lifecycleStatus.charAt(0).toUpperCase() + cow.lifecycleStatus.slice(1)}
                        </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => onEditCow(cow.id)} className="text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                            <Edit className="h-4 w-4 mr-2" /> Edit Profile
                        </Button>
                        {cow.lifecycleStatus === 'active' && (
                            <Button variant="destructive" onClick={() => onMarkCowLifecycleStatus(cow.id, 'sold')}>
                                Mark as Sold
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700 dark:text-slate-300">
                        <div><strong>Breed:</strong> {cow.breed}</div>
                        <div><strong>Gender:</strong> <span className="capitalize">{cow.gender}</span></div>
                        <div><strong>Date of Birth:</strong> {formatDate(cow.dateOfBirth)}</div>
                        <div><strong>Acquisition Date:</strong> {formatDate(cow.acquisitionDate)}</div>
                        {cow.acquisitionSource && <div><strong>Source:</strong> {cow.acquisitionSource}</div>}
                        {cow.motherId && <div><strong>Mother ID:</strong> {cow.motherId}</div>}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center text-slate-700 dark:text-slate-300">
                        <UsersRound className="h-5 w-5 mr-2 text-emerald-500" />
                        <span>Lactating: {cow.gender === 'female' ? 'Yes' : 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-slate-700 dark:text-slate-300">
                        <Baby className="h-5 w-5 mr-2 text-emerald-500" />
                        <span>Pregnant: Unknown</span>
                    </div>
                    {latestMilkRecord && (
                        <div className="flex items-center text-slate-700 dark:text-slate-300">
                            <Milk className="h-5 w-5 mr-2 text-emerald-500" />
                            <span>Last Milk: {latestMilkRecord.amount} L ({formatDate(latestMilkRecord.date)})</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Button onClick={() => onAddCowEvent(cow.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <PlusCircle className="h-4 w-4 mr-2" /> Add New Event
                    </Button>
                    <Button variant="outline" onClick={() => onRecordMilkForCow(cow.id)} className="text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                        <Milk className="h-4 w-4 mr-2" /> Record Milk
                    </Button>
                </CardContent>
            </Card>

            {/* Chronological Activity Timeline */}
            <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    {sortedEvents.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-500 dark:text-slate-400 mb-4">No events recorded for this cow yet.</p>
                            <Button onClick={() => onAddCowEvent(cow.id)} variant="outline">
                                <PlusCircle className="h-4 w-4 mr-2" /> Add First Event
                            </Button>
                        </div>
                    ) : (
                        <div className="relative pl-8">
                            <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                            {sortedEvents.map((event) => (
                                <div key={event.id} className="relative mb-6 last:mb-0">
                                    <div className="absolute -left-4 top-0 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 z-10">
                                        {getEventIcon(event.type)}
                                    </div>
                                    <div className="ml-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" /> {formatDate(event.date)}
                                        </p>
                                        <p className="font-semibold text-slate-800 dark:text-slate-100 mt-1">{event.type.replace('_', ' ')}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{event.description}</p>
                                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                                            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                                                {Object.entries(event.metadata).map(([key, value]) => (
                                                    <p key={key}>
                                                        <strong className="text-slate-700 dark:text-slate-300">
                                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                                        </strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
