"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardAlerts } from './components/DashboardAlerts';
import { dashboardApi } from '@/lib/api/dashboard';
import { api } from '@/lib/api';
import type { DashboardSummary, Alert, WeeklyMilkPoint, ActivityItem } from './types';

export default function DashboardPage() {
    const router = useRouter();
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [weeklyTrend, setWeeklyTrend] = useState<WeeklyMilkPoint[]>([]);
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // 1. Get user's farms to find the active farmId
            const farmsResponse = await api.get('/farms');
            const farms = farmsResponse.data;

            if (!farms || farms.length === 0) {
                setError("No farms found for this user.");
                return;
            }

            const farmId = farms[0].id; // Use first farm for now

            // 2. Fetch all dashboard data in parallel
            const [summaryData, alertsData, trendData, activityData] = await Promise.all([
                dashboardApi.fetchSummary(farmId),
                dashboardApi.fetchAlerts(farmId),
                dashboardApi.fetchWeeklyTrend().catch(() => []),
                dashboardApi.fetchRecentActivity().catch(() => []),
            ]);

            setSummary(summaryData);
            setAlerts(alertsData);
            setWeeklyTrend(trendData);
            setRecentActivity(activityData);
        } catch (err: any) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Failed to load dashboard data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleViewAlertAction = (alertId: string, cowId: string) => {
        router.push(`/herd-management/${cowId}`);
    };

    const handleRecordMilk = () => {
        router.push('/production-finance');
    };

    const handleLogHealthEvent = () => {
        router.push('/health-breeding');
    };

    const handleAddCow = () => {
        router.push('/herd-management');
    };

    const handleRecordExpense = () => {
        router.push('/production-finance');
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

    if (!summary) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Dashboard</h1>
            </div>
            <DashboardAlerts
                summary={summary}
                alerts={alerts}
                weeklyTrend={weeklyTrend}
                recentActivity={recentActivity}
                onViewAlertAction={handleViewAlertAction}
                onRecordMilk={handleRecordMilk}
                onLogHealthEvent={handleLogHealthEvent}
                onAddCow={handleAddCow}
                onRecordExpense={handleRecordExpense}
            />
        </div>
    );
}
