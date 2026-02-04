import { api } from '../api';
import type { CowEvent, VaccinationMetadata, BreedingMetadata, HealthMetadata, FinancialMetadata } from '@/types';

export interface CreateCowEventDto {
    cowId: string;
    type: 'HEALTH' | 'VACCINATION' | 'BREEDING' | 'NOTE' | 'FINANCIAL';
    date: string; // YYYY-MM-DD or ISO string
    description: string;
    metadata?: VaccinationMetadata | BreedingMetadata | HealthMetadata | FinancialMetadata | Record<string, any>;
}

export const cowEventsApi = {
    /**
     * Fetch all events for a specific cow
     */
    async fetchCowEvents(cowId: string): Promise<CowEvent[]> {
        const response = await api.get('/cow-events', {
            params: { cowId },
        });
        return response.data;
    },

    /**
     * Create a new event for a cow
     */
    async createCowEvent(data: CreateCowEventDto): Promise<CowEvent> {
        const response = await api.post('/cow-events', data);
        return response.data;
    },
};
