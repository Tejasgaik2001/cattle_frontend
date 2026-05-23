"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    BarChart3, 
    FileText,
    Download, 
    Droplets, 
    Wallet, 
    TrendingUp, 
    DollarSign,
    PieChart as PieChartIcon
} from 'lucide-react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { reportsApi, ReportQuery } from '@/lib/api/reports';
import { toast } from 'sonner';
import { AdvancedFilters } from './components/AdvancedFilters';
import { ReportSummaryCards } from './components/ReportSummaryCards';
import { format } from 'date-fns';

export default function ReportsAnalyticsPage() {
    const [activeTab, setActiveTab] = useState('milk');
    const [filters, setFilters] = useState<ReportQuery>({ timeframe: 'last_30_days' });
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            if (activeTab === 'milk') {
                const res = await reportsApi.getMilkProductionReport(filters);
                setData(res);
            } else if (activeTab === 'financial') {
                const res = await reportsApi.getFinancialReport(filters);
                setData(res);
            }
        } catch (err) {
            toast.error('Failed to load report data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, filters]);

    const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
        try {
            toast.info(`Generating ${format.toUpperCase()} report...`);
            const exportType = activeTab === 'milk' ? 'milk-production' : activeTab;
            await reportsApi.exportReport(exportType as any, { ...filters, format });
            toast.success('Report downloaded successfully');
        } catch (err) {
            toast.error('Export failed');
        }
    };

    const milkStats = data?.summary ? [
        { label: 'Total Production', value: `${(data.summary.totalLiters || 0).toFixed(1)} L`, icon: Droplets, color: 'bg-blue-500' },
        { label: 'Avg per Session', value: `${(data.summary.avgLitersPerSession || 0).toFixed(1)} L`, icon: TrendingUp, color: 'bg-emerald-500' },
        { label: 'Total Revenue', value: `₹${(data.summary.totalIncome || 0).toLocaleString('en-IN')}`, icon: Wallet, color: 'bg-indigo-500' },
        { label: 'Records', value: data.summary.recordCount || 0, icon: BarChart3, color: 'bg-slate-500' },
    ] : [];

    const financialStats = data?.summary ? [
        { label: 'Total Income', value: `₹${(data.summary.totalIncome || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'bg-emerald-500' },
        { label: 'Total Expense', value: `₹${(data.summary.totalExpense || 0).toLocaleString('en-IN')}`, icon: Wallet, color: 'bg-red-500' },
        { label: 'Net Profit', value: `₹${(data.summary.netProfit || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'bg-blue-500' },
        { label: 'Profit Margin', value: `${(data.summary.margin || 0).toFixed(1)}%`, icon: BarChart3, color: 'bg-amber-500' },
    ] : [];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                        Reports & Analytics
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                        Enterprise-grade reporting for your dairy business
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all">
                        <Download className="h-4 w-4" /> Excel
                    </button>
                    <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 transition-all">
                        <FileText className="h-4 w-4" /> PDF
                    </button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl h-14">
                    <TabsTrigger value="milk" className="rounded-xl px-6 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                        <Droplets className="h-4 w-4 mr-2" /> Milk Production
                    </TabsTrigger>
                    <TabsTrigger value="financial" className="rounded-xl px-6 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                        <Wallet className="h-4 w-4 mr-2" /> Financials
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="milk" className="space-y-6">
                    <AdvancedFilters filters={filters} onFilterChange={setFilters} />
                    <ReportSummaryCards stats={milkStats} />
                    
                    <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-lg font-black flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-500" />
                                Production Summary Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-96 w-full">
                                {isLoading ? (
                                    <div className="h-full flex items-center justify-center text-slate-400 font-medium animate-pulse">
                                        Summarizing trend data...
                                    </div>
                                ) : data?.trends && data.trends.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data.trends}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis 
                                                dataKey="date" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fontSize: 11, fontWeight: 'bold' }}
                                                tickFormatter={(str) => format(new Date(str), 'dd MMM')}
                                            />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="amount" 
                                                stroke="#10b981" 
                                                strokeWidth={4} 
                                                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                                        No summary data available for this period.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="financial" className="space-y-6">
                    <AdvancedFilters filters={filters} onFilterChange={setFilters} />
                    <ReportSummaryCards stats={financialStats} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-lg font-black flex items-center gap-2">
                                    <PieChartIcon className="h-5 w-5 text-indigo-500" />
                                    Category Distribution Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="h-80">
                                    {isLoading ? (
                                        <div className="h-full flex items-center justify-center text-slate-400 font-medium animate-pulse">
                                            Generating distribution...
                                        </div>
                                    ) : data?.categoryBreakdown && Object.keys(data.categoryBreakdown).length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={Object.entries(data.categoryBreakdown).map(([name, value]) => ({ 
                                                        name: name.replace('_', ' ').toUpperCase(), 
                                                        value 
                                                    }))}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={70}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {Object.entries(data.categoryBreakdown).map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'][index % 5]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                                    itemStyle={{ color: '#fff' }}
                                                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                                            No breakdown summary available.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-lg font-black flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-emerald-500" />
                                    Top Expenditure Categories
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {isLoading ? (
                                        <div className="space-y-4">
                                            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />)}
                                        </div>
                                    ) : data?.categoryBreakdown && Object.keys(data.categoryBreakdown).length > 0 ? (
                                        Object.entries(data.categoryBreakdown)
                                            .sort((a, b) => (b[1] as number) - (a[1] as number))
                                            .slice(0, 5)
                                            .map(([name, value], index) => (
                                                <div key={name} className="space-y-2">
                                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                                                        <span className="text-slate-500">{name.replace('_', ' ')}</span>
                                                        <span className="text-slate-900 dark:text-white">₹{(value as number).toLocaleString('en-IN')}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full rounded-full transition-all duration-1000" 
                                                            style={{ 
                                                                width: `${((value as number) / (data.summary.totalIncome + data.summary.totalExpense)) * 100}%`,
                                                                backgroundColor: ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'][index % 5]
                                                            }} 
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-slate-400 font-medium py-20">
                                            No summary available.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
