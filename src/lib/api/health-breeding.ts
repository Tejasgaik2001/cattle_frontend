import { api } from '../api';
import { getFarmId } from '../farm';

export interface HealthBreedingOverview {
    cowsUnderTreatment: number;
    pregnantCows: number;
    healthIssuesLast7Days: number;
    vaccinationsDueOverdueCount: number;
}

export interface HealthBreedingTask {
    id: string;
    cowId: string;
    cowTagId: string;
    cowName: string | null;
    taskType: 'VACCINATION_DUE' | 'HEALTH_FOLLOWUP' | 'PREGNANCY_CHECK' | 'CALVING_EXPECTED' | 'BREEDING_RECOMMENDATION';
    dueDate: string;
    urgency: 'high' | 'medium' | 'low';
    message: string;
}

export const healthBreedingApi = {
    /**
     * Fetch aggregated metrics for health and breeding
     */
    async getOverview(): Promise<HealthBreedingOverview> {
        const response = await api.get(`/health-breeding/overview`);
        return response.data;
    },

    /**
     * Fetch upcoming/overdue tasks
     */
    async getTasks(): Promise<HealthBreedingTask[]> {
        const response = await api.get(`/health-breeding/tasks`);
        return response.data;
    },
};
