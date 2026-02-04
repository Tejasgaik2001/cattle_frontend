"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HerdList } from './components/HerdList';
import { AddCowDialog } from './components/AddCowDialog';
import { cowsApi } from '@/lib/api/cows';
import type { Cow } from '@/types';

export default function HerdManagementPage() {
    const router = useRouter();
    const [cows, setCows] = useState<Cow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddCowDialog, setShowAddCowDialog] = useState(false);

    const fetchCows = async () => {
        try {
            setIsLoading(true);
            const data = await cowsApi.fetchCows();
            setCows(data);
        } catch (error) {
            console.error('Failed to fetch cows:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCows();
    }, []);

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
