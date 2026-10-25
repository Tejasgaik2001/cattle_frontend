"use client"

import React from 'react';
import type { Cow, CowEvent, MilkRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft, Edit, PlusCircle, Milk, Calendar,
    Droplets, Stethoscope, Baby, PiggyBank, Tag, UsersRound
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useState } from 'react';

interface CowProfileProps {
    cow: Cow;
    cowEvents: CowEvent[];
    latestMilkRecord?: MilkRecord;
    onEditCow: (cowId: string) => void;
    onAddCowEvent: (cowId: string) => void;
    onRecordMilkForCow: (cowId: string) => void;
    onMarkCowLifecycleStatus: (cowId: string, status: 'active' | 'sold' | 'deceased', saleInfo?: { soldTo: string; soldPrice: number; soldDate: string; soldDescription?: string }) => void;
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
        case 'FINANCIAL': return <PiggyBank className="h-4 w-4 text-primary" />;
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
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<'active' | 'sold' | 'deceased' | null>(null);
    const [saleDialogOpen, setSaleDialogOpen] = useState(false);
    const [saleInfo, setSaleInfo] = useState({
        soldTo: '',
        soldPrice: '',
        soldDate: format(new Date(), 'yyyy-MM-dd'),
        soldDescription: '',
    });

    // Sort events by date descending for chronological timeline
    const sortedEvents = [...cowEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleStatusChangeClick = (status: 'active' | 'sold' | 'deceased') => {
        if (status === 'sold') {
            setSaleDialogOpen(true);
        } else {
            setPendingStatus(status);
            setConfirmOpen(true);
        }
    };

    const handleConfirmStatusChange = () => {
        if (pendingStatus) {
            onMarkCowLifecycleStatus(cow.id, pendingStatus);
            setPendingStatus(null);
        }
    };

    const handleSaleSubmit = () => {
        if (!saleInfo.soldTo || !saleInfo.soldPrice || !saleInfo.soldDate) {
            return;
        }
        onMarkCowLifecycleStatus(cow.id, 'sold', {
            soldTo: saleInfo.soldTo,
            soldPrice: parseFloat(saleInfo.soldPrice),
            soldDate: saleInfo.soldDate,
            soldDescription: saleInfo.soldDescription,
        });
        setSaleDialogOpen(false);
        setSaleInfo({
            soldTo: '',
            soldPrice: '',
            soldDate: format(new Date(), 'yyyy-MM-dd'),
            soldDescription: '',
        });
    };

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
            <Button variant="ghost" onClick={onBackToHerdList} className="text-foreground/70 hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Herd
            </Button>

            {/* Top Identity Section */}
            <Card className="bg-card border-border shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-primary">
                            {cow.name || 'Untitled Cow'}
                        </h1>
                        <p className="text-xl text-foreground">
                            Tag ID: {cow.tagId}
                        </p>
                        <Badge variant={getStatusBadgeVariant(cow.lifecycleStatus)}>
                            Status: {cow.lifecycleStatus.charAt(0).toUpperCase() + cow.lifecycleStatus.slice(1)}
                        </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => onEditCow(cow.id)} className="text-foreground border-border">
                            <Edit className="h-4 w-4 mr-2" /> Edit Profile
                        </Button>
                        {cow.lifecycleStatus === 'active' && (
                            <Button variant="destructive" onClick={() => handleStatusChangeClick('sold')}>
                                Mark as Sold
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-foreground">
                        <div><strong>Breed:</strong> {cow.breed}</div>
                        <div><strong>Gender:</strong> <span className="capitalize">{cow.gender}</span></div>
                        <div><strong>Date of Birth:</strong> {formatDate(cow.dateOfBirth)}</div>
                        <div><strong>Acquisition Date:</strong> {formatDate(cow.acquisitionDate)}</div>
                        {cow.acquisitionSource && <div><strong>Source:</strong> {cow.acquisitionSource}</div>}
                        {cow.acquisitionCost && <div><strong>Acquisition Cost:</strong> ₹{cow.acquisitionCost}</div>}
                        {cow.motherId && <div><strong>Mother ID:</strong> {cow.motherId}</div>}
                        {cow.lifecycleStatus === 'sold' && (
                            <>
                                <div><strong>Sold To:</strong> {cow.soldTo}</div>
                                <div><strong>Sold Price:</strong> ₹{cow.soldPrice}</div>
                                <div><strong>Sold Date:</strong> {cow.soldDate ? formatDate(cow.soldDate) : 'N/A'}</div>
                                {cow.acquisitionCost && (
                                    <div className="col-span-2">
                                        <strong>Profit/Loss:</strong> 
                                        <span className={typeof cow.soldPrice === 'number' && typeof cow.acquisitionCost === 'number' && cow.soldPrice > cow.acquisitionCost ? 'text-emerald-600 font-bold ml-2' : typeof cow.soldPrice === 'number' && typeof cow.acquisitionCost === 'number' && cow.soldPrice < cow.acquisitionCost ? 'text-red-600 font-bold ml-2' : 'ml-2'}>
                                            ₹{typeof cow.soldPrice === 'number' && typeof cow.acquisitionCost === 'number' ? (cow.soldPrice - cow.acquisitionCost).toFixed(2) : 'N/A'}
                                        </span>
                                    </div>
                                )}
                                {cow.soldDescription && <div className="col-span-2"><strong>Sale Description:</strong> {cow.soldDescription}</div>}
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            {(() => {
                const latestBreeding = sortedEvents.find(e => e.type === 'BREEDING');
                const isPregnant = latestBreeding?.metadata && (latestBreeding.metadata as any).result === 'confirmed';
                
                // Calculate duration on farm
                const acquisitionDate = new Date(cow.acquisitionDate);
                const endDate = cow.lifecycleStatus === 'sold' && cow.soldDate ? new Date(cow.soldDate) : new Date();
                const daysOnFarm = Math.floor((endDate.getTime() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24));
                const yearsOnFarm = (daysOnFarm / 365).toFixed(1);
                
                return (
                    <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Lifecycle Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="flex items-center text-slate-700 dark:text-slate-300">
                                <UsersRound className="h-5 w-5 mr-2 text-emerald-500" />
                                <span>Lactating: {cow.gender === 'female' ? 'Yes' : 'N/A'}</span>
                            </div>
                            <div className="flex items-center text-slate-700 dark:text-slate-300">
                                <Baby className={cn("h-5 w-5 mr-2", isPregnant ? "text-pink-500" : "text-slate-400")} />
                                <span className={cn(isPregnant && "font-bold text-pink-600 dark:text-pink-400")}>
                                    Pregnant: {isPregnant ? 'Confirmed' : 'No'}
                                </span>
                            </div>
                            {latestMilkRecord && (
                                <div className="flex items-center text-slate-700 dark:text-slate-300">
                                    <Milk className="h-5 w-5 mr-2 text-emerald-500" />
                                    <span>Last Milk: {latestMilkRecord.amount} L ({formatDate(latestMilkRecord.date)})</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })()}

            {/* Duration & Cost Analysis */}
            <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Duration & Cost Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Acquisition Source</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{cow.acquisitionSource || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Acquisition Cost</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{cow.acquisitionCost ? `₹${cow.acquisitionCost}` : 'N/A'}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Duration on Farm</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                            {(() => {
                                const acquisitionDate = new Date(cow.acquisitionDate);
                                const endDate = cow.lifecycleStatus === 'sold' && cow.soldDate ? new Date(cow.soldDate) : new Date();
                                const daysOnFarm = Math.floor((endDate.getTime() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24));
                                const yearsOnFarm = (daysOnFarm / 365).toFixed(1);
                                return `${daysOnFarm} days (${yearsOnFarm} years)`;
                            })()}
                        </p>
                    </div>
                    {cow.lifecycleStatus === 'sold' && cow.acquisitionCost && cow.soldPrice && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Profit/Loss Calculation</p>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-700 dark:text-slate-300">Acquisition Cost:</span>
                                <span className="font-semibold">₹{cow.acquisitionCost}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-700 dark:text-slate-300">Sold Price:</span>
                                <span className="font-semibold">₹{cow.soldPrice}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                                <span className="font-semibold text-slate-900 dark:text-white">Net Profit/Loss:</span>
                                <span className={typeof cow.soldPrice === 'number' && typeof cow.acquisitionCost === 'number' && cow.soldPrice > cow.acquisitionCost ? 'text-emerald-600 font-bold' : typeof cow.soldPrice === 'number' && typeof cow.acquisitionCost === 'number' && cow.soldPrice < cow.acquisitionCost ? 'text-red-600 font-bold' : 'text-slate-900 dark:text-white'}>
                                    ₹{typeof cow.soldPrice === 'number' && typeof cow.acquisitionCost === 'number' ? (cow.soldPrice - cow.acquisitionCost).toFixed(2) : 'N/A'}
                                </span>
                            </div>
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
            <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-foreground">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    {sortedEvents.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground mb-4">No events recorded for this cow yet.</p>
                            <Button onClick={() => onAddCowEvent(cow.id)} variant="outline">
                                <PlusCircle className="h-4 w-4 mr-2" /> Add First Event
                            </Button>
                        </div>
                    ) : (
                        <div className="relative pl-8">
                            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                            {sortedEvents.map((event) => (
                                <div key={event.id} className="relative mb-6 last:mb-0">
                                    <div className="absolute -left-4 top-0 h-8 w-8 flex items-center justify-center rounded-full bg-muted border border-border z-10">
                                        {getEventIcon(event.type)}
                                    </div>
                                    <div className="ml-4 p-4 bg-muted rounded-lg border border-border">
                                        <p className="text-xs text-muted-foreground flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" /> {formatDate(event.date)}
                                        </p>
                                        <p className="font-semibold text-foreground mt-1">{event.type.replace('_', ' ')}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                                            <div className="mt-2 text-xs text-muted-foreground space-y-1">
                                                {Object.entries(event.metadata).map(([key, value]) => (
                                                    <p key={key}>
                                                        <strong className="text-foreground">
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

            <ConfirmationDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={pendingStatus === 'sold' ? 'Mark Cow as Sold?' : 'Change Cow Status?'}
                description={`Are you sure you want to change ${cow.name || cow.tagId}'s status to ${pendingStatus}? This will affect production and financial records.`}
                confirmText={`Yes, Mark as ${pendingStatus}`}
                onConfirm={handleConfirmStatusChange}
                variant={pendingStatus === 'deceased' || pendingStatus === 'sold' ? 'destructive' : 'default'}
            />

            {/* Sale Information Dialog */}
            <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Mark Cow as Sold</DialogTitle>
                        <DialogDescription>
                            Enter the sale details for {cow.name || cow.tagId}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="soldTo">Sold To (Buyer Name) *</Label>
                            <Input
                                id="soldTo"
                                placeholder="Ramesh Kumar"
                                value={saleInfo.soldTo}
                                onChange={(e) => setSaleInfo({ ...saleInfo, soldTo: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="soldPrice">Sale Price (₹) *</Label>
                            <Input
                                id="soldPrice"
                                type="number"
                                placeholder="45000"
                                value={saleInfo.soldPrice}
                                onChange={(e) => setSaleInfo({ ...saleInfo, soldPrice: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="soldDate">Sale Date *</Label>
                            <Input
                                id="soldDate"
                                type="date"
                                value={saleInfo.soldDate}
                                onChange={(e) => setSaleInfo({ ...saleInfo, soldDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="soldDescription">Description (Optional)</Label>
                            <textarea
                                id="soldDescription"
                                placeholder="Additional notes about the sale..."
                                value={saleInfo.soldDescription}
                                onChange={(e) => setSaleInfo({ ...saleInfo, soldDescription: e.target.value })}
                                className="min-h-20 w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSaleDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaleSubmit} disabled={!saleInfo.soldTo || !saleInfo.soldPrice || !saleInfo.soldDate}>
                            Mark as Sold
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
