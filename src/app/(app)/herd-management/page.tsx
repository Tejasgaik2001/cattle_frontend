"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HerdList } from './components/HerdList';
import { AddCowDialog } from './components/AddCowDialog';
import { cowsApi } from '@/lib/api/cows';
import type { Cow } from '@/types';

export default function HerdManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [cows, setCows] = useState<Cow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddCowDialog, setShowAddCowDialog] = useState(false);

    const fetchCows = async () => {
        try {
            setIsLoading(true);
            const params: any = {};
            
            // Map search params to API filter params
            const filter = searchParams.get('filter');
            if (filter === 'underTreatment') params.isUnderTreatment = 'true';
            if (filter === 'pregnant') params.isPregnant = 'true';
            if (filter === 'healthIssuesRecent') params.healthIssuesRecent = 'true';
            if (filter === 'vaccinationsDueOverdue') params.vaccinationsDue = 'true';
            
            // Also support direct lifecycle status if needed
            if (searchParams.get('status')) params.lifecycleStatus = searchParams.get('status');

            const data = await cowsApi.fetchCows(params);
            setCows(data);
        } catch (error) {
            console.error('Failed to fetch cows:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCows();
    }, [searchParams]);

    const handleViewCowDetails = (cowId: string) => {
        router.push(`/herd-management/${cowId}`);
    };

    const handleAddCowSuccess = () => {
        fetchCows(); // Refresh the list
    };

    return (
        <>
            <HerdList
                cows={cows}
                onAddCow={() => setShowAddCowDialog(true)}
                onViewCowDetails={handleViewCowDetails}
                isLoading={isLoading}
            />

            <AddCowDialog
                open={showAddCowDialog}
                onOpenChange={setShowAddCowDialog}
                onSuccess={handleAddCowSuccess}
            />
        </>
    );
}
