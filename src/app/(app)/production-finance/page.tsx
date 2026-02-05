"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductionFinance } from './components/ProductionFinance';
import { productionFinanceApi, OperationalInsights } from '@/lib/api/production-finance';
import { api } from '@/lib/api';
import type { ProductionFinanceOverview } from './types';

export default function ProductionFinancePage() {
    const router = useRouter();
    const [overview, setOverview] = useState<ProductionFinanceOverview | null>(null);
    const [insights, setInsights] = useState<OperationalInsights | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // 1. Get user's farms to find the active farmId
            const farmsResponse = await api.get('/farms');
            const farms = farmsResponse.data;

            if (!farms || farms.length === 0) {
                setError("No farms found for this user.");
                return;
            }

            const farmId = farms[0].id; // Use first farm for now

            // 2. Fetch overview and insights
            const [overviewData, insightsData] = await Promise.all([
                productionFinanceApi.fetchOverview(farmId),
                productionFinanceApi.fetchInsights(farmId)
            ]);

            setOverview(overviewData);
            setInsights(insightsData);
        } catch (err: any) {
            console.error('Failed to fetch production & finance data:', err);
            setError('Failed to load production and finance data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRecordMilkBulk = () => {
        // This could show a dialog or scroll to the table
        const element = document.getElementById('milk-entry-table');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleLogFinancialTransaction = () => {
        // This could show a dialog or scroll to the form
        const element = document.getElementById('financial-transaction-form');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleViewCowDetails = (cowId: string) => {
        router.push(`/herd-management/${cowId}`);
    };

    const handlePeriodChange = (period: string) => {
        console.log('Period changed to:', period);
        // In a real app, this would trigger a refetch with specific dates
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

    if (!overview || !insights) return null;

    return (
        <ProductionFinance
            overview={overview}
            topProducingCows={insights.topProducingCows}
            lowProducingCows={insights.lowProducingCows}
            highestExpenseCategories={insights.highestExpenseCategories}
            onRecordMilkBulk={handleRecordMilkBulk}
            onLogFinancialTransaction={handleLogFinancialTransaction}
            onViewCowDetails={handleViewCowDetails}
            onPeriodChange={handlePeriodChange}
        />
    );
}
