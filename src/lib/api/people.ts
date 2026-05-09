import { api } from '../api';
import type { Person } from '@/app/(app)/financials/types';

export interface CreatePersonDto {
    name: string;
    role?: 'owner' | 'family' | 'worker';
    notes?: string;
}

export const peopleApi = {
    async getAll(): Promise<Person[]> {
        const response = await api.get('/people');
        return response.data;
    },

    async create(data: CreatePersonDto): Promise<Person> {
        const response = await api.post('/people', data);
        return response.data;
    },

    async update(personId: string, data: Partial<CreatePersonDto>): Promise<Person> {
        const response = await api.patch(`/people/${personId}`, data);
        return response.data;
    },

    async delete(personId: string): Promise<void> {
        await api.delete(`/people/${personId}`);
    },

    /** Auto-create Owner person if none exists */
    async ensureOwner(): Promise<Person> {
        const response = await api.post('/people/ensure-owner');
        return response.data;
    },
};
