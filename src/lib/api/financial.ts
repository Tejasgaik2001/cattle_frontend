import { api } from '../api';

export interface CreateFinancialTransactionDto {
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string; // YYYY-MM-DD
    description?: string;
    cowId?: string;
}

export interface UpdateFinancialTransactionDto {
    type?: 'income' | 'expense';
    category?: string;
    amount?: number;
    date?: string;
    description?: string;
}

export const financialApi = {
    /**
     * Create a new financial transaction
     */
    async createTransaction(farmId: string, data: CreateFinancialTransactionDto) {
        const response = await api.post(`/financial/transactions`, data);
        return response.data;
    },

    /**
     * Get all transactions for a farm
     */
    async getTransactions(farmId: string, startDate?: string, endDate?: string) {
        const response = await api.get(`/financial/transactions`, {
            params: { startDate, endDate }
        });
        return response.data;
    },

    /**
     * Get financial overview
     */
    async getOverview(farmId: string, startDate?: string, endDate?: string) {
        const response = await api.get(`/financial/overview`, {
            params: { startDate, endDate }
        });
        return response.data;
    },

    /**
     * Get expense breakdown by category
     */
    async getExpenseBreakdown(farmId: string, startDate?: string, endDate?: string) {
        const response = await api.get(`/financial/expense-breakdown`, {
            params: { startDate, endDate }
        });
        return response.data;
    },

    /**
     * Update a transaction
     */
    async updateTransaction(farmId: string, transactionId: string, data: UpdateFinancialTransactionDto) {
        const response = await api.patch(`/financial/transactions/${transactionId}`, data);
        return response.data;
    },

    /**
     * Delete a transaction
     */
    async deleteTransaction(farmId: string, transactionId: string) {
        await api.delete(`/financial/transactions/${transactionId}`);
    }
};
