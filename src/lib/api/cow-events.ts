import { api } from '../api';
import { getFarmId } from '../farm';
import type { CowEvent, VaccinationMetadata, BreedingMetadata, HealthMetadata, FinancialMetadata } from '@/types';

export interface CreateCowEventDto {
    type: 'HEALTH' | 'VACCINATION' | 'BREEDING' | 'NOTE' | 'FINANCIAL';
    date: string; // YYYY-MM-DD or ISO string
    description: string;
    metadata?: VaccinationMetadata | BreedingMetadata | HealthMetadata | FinancialMetadata | Record<string, any>;
}

export interface UpdateCowEventDto {
    type?: 'HEALTH' | 'VACCINATION' | 'BREEDING' | 'NOTE' | 'FINANCIAL';
    date?: string;
    description?: string;
    metadata?: Record<string, any>;
}

export const cowEventsApi = {
    /**
     * Fetch all events for a specific cow
     */
    async fetchCowEvents(cowId: string, type?: string): Promise<CowEvent[]> {
        const response = await api.get(`/cows/${cowId}/events`, {
            params: { type },
        });
        // Backend returns paginated: { data: [], meta: {...} }
        return response.data?.data || response.data;
    },

    /**
     * Fetch recent events for a cow (timeline)
     */
    async fetchRecentEvents(cowId: string, limit: number = 10): Promise<CowEvent[]> {
        const response = await api.get(`/cows/${cowId}/events/recent`, {
            params: { limit },
        });
        return response.data;
    },

    /**
     * Get event counts by type for a cow
     */
    async getEventCounts(cowId: string): Promise<Record<string, number>> {
        const response = await api.get(`/cows/${cowId}/events/counts`);
        return response.data;
    },

    /**
     * Create a new event for a cow
     */
    async createCowEvent(cowId: string, data: CreateCowEventDto): Promise<CowEvent> {
        const response = await api.post(`/cows/${cowId}/events`, data);
        return response.data;
    },

    /**
     * Update an event
     */
    async updateCowEvent(cowId: string, eventId: string, data: UpdateCowEventDto): Promise<CowEvent> {
        const response = await api.patch(`/cows/${cowId}/events/${eventId}`, data);
        return response.data;
    },

    /**
     * Delete an event
     */
    async deleteCowEvent(cowId: string, eventId: string): Promise<void> {
        await api.delete(`/cows/${cowId}/events/${eventId}`);
    },
};
