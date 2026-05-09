import { api } from '../api';

export interface FinancialCategory {
    id: string;
    name: string;
    type: 'income' | 'expense';
    isSystem: boolean;
}

export const financialCategoriesApi = {
    async getAll(): Promise<FinancialCategory[]> {
        const response = await api.get('/financial-categories');
        return response.data;
    },

    async create(name: string, type: 'income' | 'expense'): Promise<FinancialCategory> {
        const response = await api.post('/financial-categories', { name, type });
        return response.data;
    },

    async remove(id: string): Promise<void> {
        await api.delete(`/financial-categories/${id}`);
    }
};
