import { api } from '../api';
import type { DashboardSummary, Alert, WeeklyMilkPoint, ActivityItem } from '@/app/(app)/dashboard/types';

export const dashboardApi = {
    /**
     * Fetch dashboard summary with aggregated metrics
     */
    async fetchSummary(farmId: string): Promise<DashboardSummary> {
        const response = await api.get(`/dashboard/summary`);
        return response.data;
    },

    /**
     * Fetch critical alerts for the farm
     */
    async fetchAlerts(farmId: string): Promise<Alert[]> {
        const response = await api.get(`/dashboard/alerts`);
        return response.data;
    },

    /**
     * Fetch milk production totals for the last 7 days
     */
    async fetchWeeklyTrend(): Promise<WeeklyMilkPoint[]> {
        const response = await api.get(`/dashboard/weekly-milk-trend`);
        return response.data;
    },

    /**
     * Fetch recent farm activity events
     */
    async fetchRecentActivity(): Promise<ActivityItem[]> {
        const response = await api.get(`/dashboard/recent-activity`);
        return response.data;
    },
};
