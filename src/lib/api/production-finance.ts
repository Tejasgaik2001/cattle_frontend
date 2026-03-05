import { api } from '../api';
import type { ProductionFinanceOverview, CowPerformanceMetric, ExpenseCategoryMetric } from '@/types';

export interface OperationalInsights {
    topProducingCows: CowPerformanceMetric[];
    lowProducingCows: CowPerformanceMetric[];
    highestExpenseCategories: ExpenseCategoryMetric[];
}

export const productionFinanceApi = {
    /**
     * Fetch aggregated overview metrics for production and finance
     */
    async fetchOverview(farmId: string, startDate?: string, endDate?: string): Promise<ProductionFinanceOverview> {
        const response = await api.get(`/production-finance/overview`, {
            params: { startDate, endDate }
        });
        return response.data;
    },

    /**
     * Fetch operational insights (producers and expenses)
     */
    async fetchInsights(farmId: string, startDate?: string, endDate?: string): Promise<OperationalInsights> {
        const response = await api.get(`/production-finance/insights`, {
            params: { startDate, endDate }
        });
        return response.data;
    }
};
