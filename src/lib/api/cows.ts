import { api } from '../api';
import { getFarmId } from '../farm';
import type { Cow } from '@/types';

export interface CreateCowDto {
    tagId: string;
    name?: string;
    gender: 'male' | 'female';
    breed: string;
    dateOfBirth: string; // YYYY-MM-DD
    acquisitionDate: string; // YYYY-MM-DD
    lifecycleStatus?: 'active' | 'sold' | 'deceased';
    acquisitionSource?: string;
    motherId?: string;
}

export interface UpdateCowDto {
    tagId?: string;
    name?: string;
    gender?: 'male' | 'female';
    breed?: string;
    dateOfBirth?: string;
    acquisitionDate?: string;
    acquisitionSource?: string;
    motherId?: string;
}

export const cowsApi = {
    /**
     * Fetch all cows for the current farm
     */
    async fetchCows(params?: { 
        search?: string; 
        lifecycleStatus?: string; 
        gender?: string; 
        breed?: string;
        isUnderTreatment?: string;
        isPregnant?: string;
        healthIssuesRecent?: string;
        vaccinationsDue?: string;
    }): Promise<Cow[]> {
        const farmId = await getFarmId();
        const response = await api.get(`/farms/${farmId}/cows`, { params });
        // Backend returns paginated result { data: Cow[], meta: {...} }
        return response.data?.data || response.data;
    },

    /**
     * Fetch a specific cow by ID
     */
    async fetchCowById(id: string): Promise<Cow> {
        const farmId = await getFarmId();
        const response = await api.get(`/farms/${farmId}/cows/${id}`);
        return response.data;
    },

    /**
     * Create a new cow
     */
    async createCow(data: CreateCowDto): Promise<Cow> {
        const farmId = await getFarmId();
        const response = await api.post(`/farms/${farmId}/cows`, data);
        return response.data;
    },

    /**
     * Update an existing cow
     */
    async updateCow(id: string, data: UpdateCowDto): Promise<Cow> {
        const farmId = await getFarmId();
        const response = await api.patch(`/farms/${farmId}/cows/${id}`, data);
        return response.data;
    },

    /**
     * Update cow lifecycle status
     */
    async updateCowLifecycleStatus(
        id: string,
        status: 'active' | 'sold' | 'deceased'
    ): Promise<Cow> {
        const farmId = await getFarmId();
        const response = await api.patch(`/farms/${farmId}/cows/${id}/lifecycle`, { lifecycleStatus: status });
        return response.data;
    },

    /**
     * Delete a cow
     */
    async deleteCow(id: string): Promise<void> {
        const farmId = await getFarmId();
        await api.delete(`/farms/${farmId}/cows/${id}`);
    },

    /**
     * Get herd statistics
     */
    async getHerdStats(): Promise<{ total: number; active: number; sold: number; deceased: number }> {
        const farmId = await getFarmId();
        const response = await api.get(`/farms/${farmId}/cows/stats`);
        return response.data;
    },

    /**
     * Get active female cows (for dropdowns)
     */
    async getActiveFemales(): Promise<{ id: string; tagId: string; name: string | null }[]> {
        const farmId = await getFarmId();
        const response = await api.get(`/farms/${farmId}/cows/active-females`);
        return response.data;
    },
};
