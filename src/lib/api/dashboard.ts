import { api } from '../api';
import type { DashboardSummary, Alert } from '@/app/(app)/dashboard/types';

export const dashboardApi = {
    /**
     * Fetch dashboard summary with aggregated metrics
     */
    async fetchSummary(farmId: string): Promise<DashboardSummary> {
        const response = await api.get(`/farms/${farmId}/dashboard/summary`);
        return response.data;
    },

    /**
     * Fetch critical alerts for the farm
     */
    async fetchAlerts(farmId: string): Promise<Alert[]> {
        const response = await api.get(`/farms/${farmId}/dashboard/alerts`);
        return response.data;
    }
};
