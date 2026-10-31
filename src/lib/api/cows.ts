import { api } from '../api';
import { getFarmId } from '../farm';
import type { Cow, ExternalBull, PedigreeNode } from '@/types';

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
    sireId?: string;
    externalSireId?: string;
    breedingMethod?: 'NATURAL' | 'AI';
    bornOnFarm?: boolean;
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
    sireId?: string;
    externalSireId?: string;
    breedingMethod?: 'NATURAL' | 'AI';
    bornOnFarm?: boolean;
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
        const response = await api.get(`/cows`, { params });
        // Backend returns paginated result { data: Cow[], meta: {...} }
        return response.data?.data || response.data;
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
        const response = await api.post(`/cows`, data);
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
        status: 'active' | 'sold' | 'deceased',
        saleInfo?: { soldTo: string; soldPrice: number; soldDate: string; soldDescription?: string }
    ): Promise<Cow> {
        const response = await api.patch(`/cows/${id}/lifecycle`, { 
            lifecycleStatus: status,
            ...(saleInfo && { soldTo: saleInfo.soldTo, soldPrice: saleInfo.soldPrice, soldDate: saleInfo.soldDate, soldDescription: saleInfo.soldDescription })
        });
        return response.data;
    },

    /**
     * Delete a cow
     */
    async deleteCow(id: string): Promise<void> {
        await api.delete(`/cows/${id}`);
    },

    /**
     * Get herd statistics
     */
    async getHerdStats(): Promise<{ total: number; active: number; sold: number; deceased: number }> {
        const response = await api.get(`/cows/stats`);
        return response.data;
    },

    /**
     * Get active female cows (for dam dropdowns)
     */
    async getActiveFemales(): Promise<{ id: string; tagId: string; name: string | null }[]> {
        const response = await api.get(`/cows/active-females`);
        return response.data;
    },

    /**
     * Get active male bulls (for on-farm sire dropdowns)
     */
    async getActiveMales(): Promise<{ id: string; tagId: string; name: string | null }[]> {
        const response = await api.get(`/cows/active-males`);
        return response.data;
    },

    /**
     * Get all external bulls (for AI breeding)
     */
    async getExternalBulls(): Promise<ExternalBull[]> {
        const response = await api.get(`/cows/external-bulls`);
        return response.data;
    },

    /**
     * Create an external bull record
     */
    async createExternalBull(data: {
        name: string;
        registrationNo: string;
        breed?: string;
        source?: string;
        notes?: string;
    }): Promise<ExternalBull> {
        const response = await api.post(`/cows/external-bulls`, data);
        return response.data;
    },

    /**
     * Get family tree data for all cows in relatives-tree Node format
     */
    async getFamilyTree(rootId?: string): Promise<PedigreeNode[]> {
        const response = await api.get(`/cows/family-tree`, {
            params: rootId ? { rootId } : undefined,
        });
        return response.data;
    },
};
