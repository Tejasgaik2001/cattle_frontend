"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HealthBreeding } from './components/HealthBreeding';
import { healthBreedingApi } from '@/lib/api/health-breeding';
import { api } from '@/lib/api';
import type { HealthBreedingOverview, HealthBreedingTask } from '@/types';

export default function HealthBreedingPage() {
    const router = useRouter();
    const [overview, setOverview] = useState<HealthBreedingOverview | null>(null);
    const [tasks, setTasks] = useState<HealthBreedingTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch overview and tasks using the API client
            const [overviewData, tasksData] = await Promise.all([
                healthBreedingApi.getOverview(),
                healthBreedingApi.getTasks()
            ]);

            setOverview(overviewData);
            setTasks(tasksData);
        } catch (err: any) {
            console.error('Failed to fetch health & breeding data:', err);
            setError('Failed to load health and breeding data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleViewFilteredHerd = (filterType: string) => {
        // Navigation logic for filters
        router.push(`/herd-management?filter=${filterType}`);
    };

    const handleViewTaskDetails = (taskId: string, cowId: string) => {
        // Navigate to cow profile
        router.push(`/herd-management/${cowId}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!overview) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Health & Breeding</h1>
                <p className="text-slate-600 dark:text-slate-400">Herd-level overview and task management</p>
            </div>

            <HealthBreeding
                overview={overview}
                upcomingTasks={tasks}
                onViewFilteredHerd={handleViewFilteredHerd}
                onViewTaskDetails={handleViewTaskDetails}
            />
        </div>
    );
}
