import { api } from '../api';
import type {
    MilkProductionTrendData,
    FinancialTrendData,
    ExpenseBreakdownData,
} from '@/app/(app)/reports-analytics/types';

export interface ReportQuery {
    timeframe?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    cowId?: string;
    category?: string;
    format?: 'excel' | 'csv' | 'pdf';
}

export const reportsApi = {
    /**
     * Fetch milk production trends (monthly overview)
     */
    async fetchMilkProductionTrends(
        farmId: string,
        startDate?: string,
        endDate?: string
    ): Promise<MilkProductionTrendData[]> {
        const response = await api.get(`/reports/milk-production-trends`, {
            params: { startDate, endDate }
        });
        return response.data;
    },

    /**
     * Fetch detailed milk production report with summaries and records
     */
    async getMilkProductionReport(query: ReportQuery) {
        const response = await api.get(`/reports/milk-production`, { params: query });
        return response.data;
    },

    /**
     * Fetch detailed financial report with categories and summaries
     */
    async getFinancialReport(query: ReportQuery) {
        const response = await api.get(`/reports/financial`, { params: query });
        return response.data;
    },

    /**
     * Fetch detailed health report
     */
    async getHealthReport(query: ReportQuery) {
        const response = await api.get(`/reports/health`, { params: query });
        return response.data;
    },

    /**
     * Fetch export history
     */
    async getExportHistory() {
        const response = await api.get(`/reports/history`);
        return response.data;
    },

    /**
     * Fetch herd predictions and analytics
     */
    async getPredictions() {
        const response = await api.get(`/reports/predictions`);
        return response.data;
    },

    /**
     * Generate and download report file
     */
    async exportReport(type: 'milk-production' | 'financial', query: ReportQuery) {
        const response = await api.get(`/reports/export/${type}`, {
            params: query,
            responseType: 'blob'
        });
        
        // Handle download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const ext = query.format === 'excel' ? 'xlsx' : query.format || 'pdf';
        link.setAttribute('download', `${type}_report_${new Date().getTime()}.${ext}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },

    /**
     * Fetch financial performance trends
     */
    async fetchFinancialTrends(
        farmId: string,
        startDate?: string,
        endDate?: string
    ): Promise<FinancialTrendData[]> {
        const response = await api.get(`/reports/financial-trends`, {
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
        const response = await api.get(`/reports/expense-breakdown`, {
            params: { startDate, endDate }
        });
        return response.data;
    }
};
