"use client"

import React, { useState, useEffect } from 'react';
import { ReportHeader } from './components/ReportHeader';
import { MilkProductionReport } from './components/MilkProductionReport';
import { FinancialPerformanceReport } from './components/FinancialPerformanceReport';
import { reportsApi } from '@/lib/api/reports';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type {
    ReportPeriod,
    MilkProductionTrendData,
    FinancialTrendData,
    ExpenseBreakdownData,
} from './types';

export default function ReportsAnalyticsPage() {
    const [milkTrends, setMilkTrends] = useState<MilkProductionTrendData[]>([]);
    const [financialTrends, setFinancialTrends] = useState<FinancialTrendData[]>([]);
    const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseBreakdownData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentPeriod: ReportPeriod = {
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        label: 'Last 6 Months'
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Get user's farms
            const farmsResponse = await api.get('/farms');
            const farms = farmsResponse.data;

            if (!farms || farms.length === 0) {
                setError("No farms found for this user.");
                return;
            }

            const farmId = farms[0].id;

            // Fetch all report data
            const [milkData, financialData, expenseData] = await Promise.all([
                reportsApi.fetchMilkProductionTrends(farmId, currentPeriod.startDate, currentPeriod.endDate),
                reportsApi.fetchFinancialTrends(farmId, currentPeriod.startDate, currentPeriod.endDate),
                reportsApi.fetchExpenseBreakdown(farmId, currentPeriod.startDate, currentPeriod.endDate)
            ]);

            setMilkTrends(milkData);
            setFinancialTrends(financialData);
            setExpenseBreakdown(expenseData);
        } catch (err: any) {
            console.error('Failed to fetch reports data:', err);
            setError('Failed to load reports data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleExportData = (reportType: string, format: 'CSV' | 'PDF') => {
        console.log(`Exporting ${reportType} as ${format}`);
        // TODO: Implement export functionality
        toast(`Export feature coming soon! (${reportType} as ${format})`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    Reports & Analytics
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Comprehensive insights and trends for your farm
                </p>
            </div>

            {/* Milk Production Report */}
            <div>
                <ReportHeader
                    currentPeriod={currentPeriod}
                    onExportData={handleExportData}
                    reportTitle="Milk Production Trends"
                />
                <MilkProductionReport data={milkTrends} />
            </div>

            {/* Financial Performance Report */}
            <div className="mt-8">
                <ReportHeader
                    currentPeriod={currentPeriod}
                    onExportData={handleExportData}
                    reportTitle="Financial Performance"
                />
                <FinancialPerformanceReport
                    incomeExpenseTrend={financialTrends}
                    expenseBreakdown={expenseBreakdown}
                />
            </div>
        </div>
    );
}
