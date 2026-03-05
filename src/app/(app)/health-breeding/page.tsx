"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { HealthBreedingOverviewCard } from './components/HealthBreedingOverviewCard';
import { UpcomingTasksList } from './components/UpcomingTasksList';
import { CowHealthTable } from './components/CowHealthTable';
import { CowDetailDrawer } from './components/CowDetailDrawer';
import { AddHealthRecordModal } from './components/AddHealthRecordModal';
import { AddBreedingEventModal } from './components/AddBreedingEventModal';
import { healthBreedingApi } from '@/lib/api/health-breeding';
import type { HealthBreedingOverview, HealthBreedingTask, CowHealthBreedingRow } from '@/lib/api/health-breeding';

export default function HealthBreedingPage() {
    const [overview, setOverview] = useState<HealthBreedingOverview | null>(null);
    const [tasks, setTasks] = useState<HealthBreedingTask[]>([]);
    const [cows, setCows] = useState<CowHealthBreedingRow[]>([]);
    const [isLoadingOverview, setIsLoadingOverview] = useState(true);
    const [isLoadingCows, setIsLoadingCows] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Drawer & Modal state
    const [drawerCow, setDrawerCow] = useState<CowHealthBreedingRow | null>(null);
    const [healthModalCow, setHealthModalCow] = useState<CowHealthBreedingRow | null>(null);
    const [breedingModalCow, setBreedingModalCow] = useState<CowHealthBreedingRow | null>(null);

    const fetchOverviewAndTasks = useCallback(async () => {
        try {
            setIsLoadingOverview(true);
            const [overviewData, tasksData] = await Promise.all([
                healthBreedingApi.getOverview(),
                healthBreedingApi.getTasks(),
            ]);
            setOverview(overviewData);
            setTasks(tasksData);
        } catch (err) {
            console.error('Failed to fetch overview/tasks:', err);
            setError('Failed to load health and breeding data.');
        } finally {
            setIsLoadingOverview(false);
        }
    }, []);

    const fetchCowList = useCallback(async () => {
        try {
            setIsLoadingCows(true);
            const cowData = await healthBreedingApi.getCowList();
            setCows(cowData);
        } catch (err) {
            console.error('Failed to fetch cow list:', err);
        } finally {
            setIsLoadingCows(false);
        }
    }, []);

    useEffect(() => {
        fetchOverviewAndTasks();
        fetchCowList();
    }, []);

    const handleFormSuccess = useCallback(() => {
        // Refresh both overview and cow list after adding a record
        fetchOverviewAndTasks();
        fetchCowList();
    }, [fetchOverviewAndTasks, fetchCowList]);

    const handleOpenHealthModal = useCallback((cow: CowHealthBreedingRow) => {
        setDrawerCow(null);     // Close drawer if open
        setHealthModalCow(cow);
    }, []);

    const handleOpenBreedingModal = useCallback((cow: CowHealthBreedingRow) => {
        setDrawerCow(null);     // Close drawer if open
        setBreedingModalCow(cow);
    }, []);

    if (!isLoadingOverview && error && !overview) {
        return (
            <div className="p-8 text-center bg-slate-800/50 rounded-xl border border-slate-700 shadow-sm">
                <p className="text-slate-400 mb-4">{error}</p>
                <button
                    onClick={() => { fetchOverviewAndTasks(); fetchCowList(); }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    const defaultOverview: HealthBreedingOverview = {
        cowsUnderTreatment: 0,
        pregnantCows: 0,
        healthIssuesLast7Days: 0,
        vaccinationsDueOverdueCount: 0,
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-50">Health & Breeding</h1>
                <p className="text-slate-400 mt-1">Cow-level health records, breeding events, and reminders</p>
            </div>

            {/* Section 1 – Overview Cards */}
            {isLoadingOverview ? (
                <div className="h-36 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                </div>
            ) : (
                <HealthBreedingOverviewCard
                    overview={overview ?? defaultOverview}
                    onViewFilteredHerd={(filter) => {
                        // Scroll to cow table and pre-apply filter
                        const el = document.getElementById('cow-health-table');
                        el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                />
            )}

            {/* Section 2 – Cow Health & Breeding Table */}
            <div id="cow-health-table">
                <CowHealthTable
                    cows={cows}
                    isLoading={isLoadingCows}
                    onViewHistory={setDrawerCow}
                    onAddHealthRecord={handleOpenHealthModal}
                    onAddBreedingEvent={handleOpenBreedingModal}
                />
            </div>

            {/* Section 3 – Upcoming Tasks */}
            <UpcomingTasksList
                tasks={tasks}
                onViewTaskDetails={(taskId, cowId) => {
                    const cow = cows.find(c => c.id === cowId);
                    if (cow) setDrawerCow(cow);
                }}
            />

            {/* Cow Detail Drawer */}
            <CowDetailDrawer
                cow={drawerCow}
                onClose={() => setDrawerCow(null)}
                onAddHealthRecord={handleOpenHealthModal}
                onAddBreedingEvent={handleOpenBreedingModal}
            />

            {/* Add Health Record Modal */}
            <AddHealthRecordModal
                cow={healthModalCow}
                onClose={() => setHealthModalCow(null)}
                onSuccess={handleFormSuccess}
            />

            {/* Add Breeding Event Modal */}
            <AddBreedingEventModal
                cow={breedingModalCow}
                onClose={() => setBreedingModalCow(null)}
                onSuccess={handleFormSuccess}
            />
        </div>
    );
}
