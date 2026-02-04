import { api } from '../api';
import type { Cow } from '@/types';

export interface CreateCowDto {
    tagId: string;
    name?: string;
    gender: 'male' | 'female';
    breed: string;
    dateOfBirth: string; // YYYY-MM-DD
    acquisitionDate: string; // YYYY-MM-DD
    lifecycleStatus: 'active' | 'sold' | 'deceased';
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
    async fetchCows(): Promise<Cow[]> {
        const response = await api.get('/cows');
        return response.data;
    },

    /**
     * Fetch a specific cow by ID
     */
    async fetchCowById(id: string): Promise<Cow> {
        const response = await api.get(`/cows/${id}`);
        return response.data;
    },

    /**
     * Create a new cow
     */
    async createCow(data: CreateCowDto): Promise<Cow> {
        const response = await api.post('/cows', data);
        return response.data;
    },

    /**
     * Update an existing cow
     */
    async updateCow(id: string, data: UpdateCowDto): Promise<Cow> {
        const response = await api.patch(`/cows/${id}`, data);
        return response.data;
    },

    /**
     * Update cow lifecycle status
     */
    async updateCowLifecycleStatus(
        id: string,
        status: 'active' | 'sold' | 'deceased'
    ): Promise<Cow> {
        const response = await api.patch(`/cows/${id}/lifecycle-status`, { lifecycleStatus: status });
        return response.data;
    },
};
