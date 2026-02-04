"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CowProfile } from '../components/CowProfile';
import { AddEventDialog } from '../components/AddEventDialog';
import { cowsApi } from '@/lib/api/cows';
import { cowEventsApi } from '@/lib/api/cow-events';
import type { Cow, CowEvent } from '@/types';

export default function CowProfilePage() {
    const router = useRouter();
    const params = useParams();
    const cowId = params.cowId as string;

    const [cow, setCow] = useState<Cow | null>(null);
    const [cowEvents, setCowEvents] = useState<CowEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddEventDialog, setShowAddEventDialog] = useState(false);

    const fetchCowData = async () => {
        try {
            setIsLoading(true);
            const [cowData, eventsData] = await Promise.all([
                cowsApi.fetchCowById(cowId),
                cowEventsApi.fetchCowEvents(cowId),
            ]);
            setCow(cowData);
            setCowEvents(eventsData);
        } catch (error) {
            console.error('Failed to fetch cow data:', error);
            // If cow not found, redirect to herd list
            router.push('/herd-management');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (cowId) {
            fetchCowData();
        }
    }, [cowId]);

    const handleBackToHerdList = () => {
        router.push('/herd-management');
    };

    const handleEditCow = (cowId: string) => {
        // TODO: Implement edit dialog
        console.log('Edit cow:', cowId);
    };

    const handleAddEventSuccess = () => {
        fetchCowData(); // Refresh the data
    };

    const handleRecordMilk = (cowId: string) => {
        // TODO: Navigate to milk recording or open dialog
        console.log('Record milk for cow:', cowId);
    };

    const handleMarkLifecycleStatus = async (cowId: string, status: 'active' | 'sold' | 'deceased') => {
        try {
            await cowsApi.updateCowLifecycleStatus(cowId, status);
            fetchCowData(); // Refresh
        } catch (error) {
            console.error('Failed to update lifecycle status:', error);
        }
    };

    if (!cow) {
        return null; // Or a loading state
    }

    return (
        <>
            <CowProfile
                cow={cow}
                cowEvents={cowEvents}
                onEditCow={handleEditCow}
                onAddCowEvent={() => setShowAddEventDialog(true)}
                onRecordMilkForCow={handleRecordMilk}
                onMarkCowLifecycleStatus={handleMarkLifecycleStatus}
                onBackToHerdList={handleBackToHerdList}
                isLoading={isLoading}
            />

            <AddEventDialog
                open={showAddEventDialog}
                onOpenChange={setShowAddEventDialog}
                cowId={cowId}
                onSuccess={handleAddEventSuccess}
            />
        </>
    );
}
