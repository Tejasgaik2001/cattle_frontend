import { api } from '../api';
import type {
    MilkProductionTrendData,
    FinancialTrendData,
    ExpenseBreakdownData,
} from '@/app/(app)/reports-analytics/types';

export const reportsApi = {
    /**
     * Fetch milk production trends
     */
    async fetchMilkProductionTrends(
        farmId: string,
        startDate?: string,
        endDate?: string
    ): Promise<MilkProductionTrendData[]> {
        const response = await api.get(`/farms/${farmId}/reports/milk-production-trends`, {
            params: { startDate, endDate }
        });
        return response.data;
    },

    /**
     * Fetch financial performance trends
     */
    async fetchFinancialTrends(
        farmId: string,
        startDate?: string,
        endDate?: string
    ): Promise<FinancialTrendData[]> {
        const response = await api.get(`/farms/${farmId}/reports/financial-trends`, {
            params: { startDate, endDate }
        });
        return response.data;
    },

    /**
     * Fetch expense breakdown by category
     */
    async fetchExpenseBreakdown(
        farmId: string,
        startDate?: string,
        endDate?: string
    ): Promise<ExpenseBreakdownData[]> {
        const response = await api.get(`/farms/${farmId}/reports/expense-breakdown`, {
            params: { startDate, endDate }
        });
        return response.data;
    }
};
