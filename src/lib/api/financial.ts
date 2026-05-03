import { api } from '../api';

export interface CreateFinancialTransactionDto {
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string; // YYYY-MM-DD
    description?: string;
    cowId?: string;
    paidById?: string;
}

export interface UpdateFinancialTransactionDto {
    type?: 'income' | 'expense';
    category?: string;
    amount?: number;
    date?: string;
    description?: string;
    paidById?: string;
}

export interface CategoryBreakdown {
    category: string;
    amount: number;
    percentage: number;
}

export interface SpendingByPerson {
    personId: string;
    name: string;
    role: string;
    amount: number;
    pendingReimbursement: boolean;
}

export interface MonthlySummary {
    period: string;
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    expenseByCategory: CategoryBreakdown[];
    incomeByCategory: CategoryBreakdown[];
    recentTransactions: FinancialTransactionRecord[];
    spendingByPerson: SpendingByPerson[];
}

export interface FinancialTransactionRecord {
    id: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string;
    description?: string;
    paidById?: string;
    paidBy?: { id: string; name: string; role: string };
    cowId?: string;
    createdAt: string;
}

export const financialApi = {
    async createTransaction(farmId: string, data: CreateFinancialTransactionDto) {
        const response = await api.post(`/financial/transactions`, data);
        return response.data;
    },

    async getTransactions(farmId: string, params?: {
        startDate?: string;
        endDate?: string;
        type?: string;
        category?: string;
        page?: number;
        limit?: number;
    }) {
        const response = await api.get(`/financial/transactions`, { params });
        return response.data;
    },

    async getOverview(farmId: string, startDate?: string, endDate?: string) {
        const response = await api.get(`/financial/overview`, {
            params: { startDate, endDate }
        });
        return response.data;
    },

    async getExpenseBreakdown(farmId: string, startDate?: string, endDate?: string) {
        const response = await api.get(`/financial/expense-breakdown`, {
            params: { startDate, endDate }
        });
        return response.data;
    },

    async getMonthlySummary(year?: number, month?: number): Promise<MonthlySummary> {
        const response = await api.get(`/financial/summary/monthly`, {
            params: { year, month }
        });
        return response.data;
    },

    async getTodaySummary(): Promise<{ todayIncome: number; todayExpense: number }> {
        const response = await api.get(`/financial/summary/today`);
        return response.data;
    },

    async getLast7DaysTrend(): Promise<Array<{ date: string; income: number; expense: number }>> {
        const response = await api.get(`/financial/summary/trend`);
        return response.data;
    },

    async updateTransaction(farmId: string, transactionId: string, data: UpdateFinancialTransactionDto) {
        const response = await api.patch(`/financial/transactions/${transactionId}`, data);
        return response.data;
    },

    async deleteTransaction(farmId: string, transactionId: string) {
        await api.delete(`/financial/transactions/${transactionId}`);
    }
};
