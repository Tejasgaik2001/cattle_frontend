import { api } from '../api';
import type { HealthBreedingOverview, HealthBreedingTask } from '@/types';

export const healthBreedingApi = {
    /**
     * Fetch aggregated overview metrics for health and breeding
     */
    async fetchOverview(farmId: string): Promise<HealthBreedingOverview> {
        const response = await api.get(`/farms/${farmId}/health-breeding/overview`);
        return response.data;
    },

    /**
     * Fetch upcoming and overdue health/breeding tasks
     */
    async fetchTasks(farmId: string): Promise<HealthBreedingTask[]> {
        const response = await api.get(`/farms/${farmId}/health-breeding/tasks`);
        return response.data;
    }
};
