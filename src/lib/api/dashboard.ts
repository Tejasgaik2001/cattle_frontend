import { api } from '../api';
import type { DashboardSummary, Alert } from '@/app/(app)/dashboard/types';

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
    }
};
