"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, FileText, Download, History, Droplets, Wallet, TrendingUp, Filter, HeartPulse, Activity, DollarSign } from 'lucide-react';
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
    const [exportHistory, setExportHistory] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            if (activeTab === 'milk') {
                const res = await reportsApi.getMilkProductionReport(filters);
                setData(res);
            } else if (activeTab === 'financial') {
                const res = await reportsApi.getFinancialReport(filters);
                setData(res);
            } else if (activeTab === 'health') {
                const res = await reportsApi.getHealthReport(filters);
                setData(res);
            } else if (activeTab === 'history') {
                const res = await reportsApi.getExportHistory();
                setExportHistory(res);
            } else if (activeTab === 'analytics') {
                const res = await reportsApi.getPredictions();
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
            await reportsApi.exportReport(activeTab as any, { ...filters, format });
            toast.success('Report downloaded successfully');
            if (activeTab === 'history') fetchData();
        } catch (err) {
            toast.error('Export failed');
        }
    };

    const milkStats = data?.summary ? [
        { label: 'Total Production', value: `${data.summary.totalLiters.toFixed(1)} L`, icon: Droplets, color: 'bg-blue-500' },
        { label: 'Avg per Session', value: `${data.summary.avgLitersPerSession.toFixed(1)} L`, icon: TrendingUp, color: 'bg-emerald-500' },
        { label: 'Total Revenue', value: `₹${data.summary.totalIncome.toLocaleString('en-IN')}`, icon: Wallet, color: 'bg-indigo-500' },
        { label: 'Record Count', value: data.summary.recordCount, icon: FileText, color: 'bg-slate-500' },
    ] : [];

    const financialStats = data?.summary ? [
        { label: 'Total Income', value: `₹${data.summary.totalIncome.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'bg-emerald-500' },
        { label: 'Total Expense', value: `₹${data.summary.totalExpense.toLocaleString('en-IN')}`, icon: Wallet, color: 'bg-red-500' },
        { label: 'Net Profit', value: `₹${data.summary.netProfit.toLocaleString('en-IN')}`, icon: DollarSign, color: 'bg-blue-500' },
        { label: 'Profit Margin', value: `${data.summary.margin.toFixed(1)}%`, icon: BarChart3, color: 'bg-amber-500' },
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
                    <TabsTrigger value="health" className="rounded-xl px-6 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                        <HeartPulse className="h-4 w-4 mr-2" /> Health
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="rounded-xl px-6 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                        <TrendingUp className="h-4 w-4 mr-2" /> Predictions
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-xl px-6 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                        <History className="h-4 w-4 mr-2" /> History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="milk" className="space-y-6">
                    <AdvancedFilters filters={filters} onFilterChange={setFilters} />
                    <ReportSummaryCards stats={milkStats} />
                    
                    <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-lg font-black flex items-center gap-2">
                                <FileText className="h-5 w-5 text-emerald-500" />
                                Detailed Records
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase text-[11px] font-black tracking-widest">
                                            <th className="px-6 py-4 text-left">Date</th>
                                            <th className="px-6 py-4 text-left">Session</th>
                                            <th className="px-6 py-4 text-left">Cow</th>
                                            <th className="px-6 py-4 text-right">Liters</th>
                                            <th className="px-6 py-4 text-right">Rate</th>
                                            <th className="px-6 py-4 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {isLoading ? (
                                            <tr><td colSpan={6} className="py-20 text-center text-slate-400">Loading records...</td></tr>
                                        ) : data?.records.length === 0 ? (
                                            <tr><td colSpan={6} className="py-20 text-center text-slate-400">No records found for this period.</td></tr>
                                        ) : data?.records.map((r: any) => (
                                            <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 font-bold">{format(new Date(r.date), 'dd MMM yyyy')}</td>
                                                <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase">{r.milkingTime}</span></td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-emerald-600">{r.cow?.tagId}</span>
                                                        <span className="text-[11px] text-slate-400">{r.cow?.name || 'Unnamed'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black">{Number(r.amount).toFixed(1)} L</td>
                                                <td className="px-6 py-4 text-right text-slate-500">₹{r.pricePerLiter}</td>
                                                <td className="px-6 py-4 text-right font-black text-emerald-600">₹{Number(r.totalValue).toLocaleString('en-IN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="financial" className="space-y-6">
                    <AdvancedFilters filters={filters} onFilterChange={setFilters} />
                    <ReportSummaryCards stats={financialStats} />
                    
                    <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-lg font-black flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-emerald-500" />
                                Transaction Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase text-[11px] font-black tracking-widest">
                                            <th className="px-6 py-4 text-left">Date</th>
                                            <th className="px-6 py-4 text-left">Category</th>
                                            <th className="px-6 py-4 text-left">Description</th>
                                            <th className="px-6 py-4 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {isLoading ? (
                                            <tr><td colSpan={4} className="py-20 text-center text-slate-400">Loading transactions...</td></tr>
                                        ) : data?.transactions.length === 0 ? (
                                            <tr><td colSpan={4} className="py-20 text-center text-slate-400">No transactions found for this period.</td></tr>
                                        ) : data?.transactions.map((t: any) => (
                                            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 font-bold">{format(new Date(t.date), 'dd MMM yyyy')}</td>
                                                <td className="px-6 py-4"><span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase">{t.category}</span></td>
                                                <td className="px-6 py-4 text-slate-500">{t.description}</td>
                                                <td className={`px-6 py-4 text-right font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {t.type === 'income' ? '+' : '-'} ₹{Number(t.amount).toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="health" className="space-y-6">
                    <AdvancedFilters filters={filters} onFilterChange={setFilters} />
                    <ReportSummaryCards stats={[
                        { label: 'Total Events', value: data?.summary?.totalEvents || 0, icon: Activity, color: 'bg-indigo-500' },
                        { label: 'Vaccinations', value: data?.summary?.VACCINATION || 0, icon: HeartPulse, color: 'bg-emerald-500' },
                        { label: 'Treatments', value: data?.summary?.MEDICAL_TREATMENT || 0, icon: Droplets, color: 'bg-amber-500' },
                    ]} />
                    
                    <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-lg font-black flex items-center gap-2">
                                <HeartPulse className="h-5 w-5 text-emerald-500" />
                                Health Records
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase text-[11px] font-black tracking-widest">
                                            <th className="px-6 py-4 text-left">Date</th>
                                            <th className="px-6 py-4 text-left">Type</th>
                                            <th className="px-6 py-4 text-left">Cow</th>
                                            <th className="px-6 py-4 text-left">Description</th>
                                            <th className="px-6 py-4 text-right">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {isLoading ? (
                                            <tr><td colSpan={5} className="py-20 text-center text-slate-400">Loading health records...</td></tr>
                                        ) : data?.records.length === 0 ? (
                                            <tr><td colSpan={5} className="py-20 text-center text-slate-400">No records found for this period.</td></tr>
                                        ) : data?.records.map((r: any) => (
                                            <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 font-bold">{format(new Date(r.date), 'dd MMM yyyy')}</td>
                                                <td className="px-6 py-4"><span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-full text-[10px] font-black uppercase">{r.type.replace('_', ' ')}</span></td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-emerald-600">{r.cow?.tagId}</span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{r.description}</td>
                                                <td className="px-6 py-4 text-right font-black">₹{(r.metadata as any)?.cost || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Calving Predictions */}
                        <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-lg font-black flex items-center gap-2 text-indigo-600">
                                    <BarChart3 className="h-5 w-5" />
                                    Calving Predictions (90d)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {data?.calvingPredictions?.length === 0 ? (
                                        <div className="p-10 text-center text-slate-400">No upcoming calvings predicted.</div>
                                    ) : data?.calvingPredictions?.map((p: any) => (
                                        <div key={p.tagId} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black">{p.tagId.slice(-2)}</div>
                                                <div>
                                                    <p className="font-bold">{p.tagId} - {p.name || 'Unnamed'}</p>
                                                    <p className="text-xs text-slate-400">Expected: {format(new Date(p.expectedDate), 'dd MMM yyyy')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.daysRemaining < 10 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {p.daysRemaining} days left
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Performers */}
                        <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-lg font-black flex items-center gap-2 text-emerald-600">
                                    <TrendingUp className="h-5 w-5" />
                                    Top Productive Cows
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {data?.performance?.topPerformers?.map((p: any, idx: number) => (
                                        <div key={p.tagId} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold">#{idx + 1}</div>
                                                <div>
                                                    <p className="font-bold">{p.tagId}</p>
                                                    <p className="text-xs text-slate-400">{p.name || 'Unnamed'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-emerald-600">{Number(p.avgDaily).toFixed(1)} L/day</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold">Total: {Number(p.totalProduced).toFixed(0)}L</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                    <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-lg font-black flex items-center gap-2">
                                <History className="h-5 w-5 text-emerald-500" />
                                Download History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase text-[11px] font-black tracking-widest">
                                            <th className="px-6 py-4 text-left">Generated At</th>
                                            <th className="px-6 py-4 text-left">Report Type</th>
                                            <th className="px-6 py-4 text-left">Format</th>
                                            <th className="px-6 py-4 text-left">File Name</th>
                                            <th className="px-6 py-4 text-right">Size</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {isLoading ? (
                                            <tr><td colSpan={5} className="py-20 text-center text-slate-400">Loading history...</td></tr>
                                        ) : exportHistory.length === 0 ? (
                                            <tr><td colSpan={5} className="py-20 text-center text-slate-400">No export history found.</td></tr>
                                        ) : exportHistory.map((h: any) => (
                                            <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 font-bold">{format(new Date(h.createdAt), 'dd MMM yyyy HH:mm')}</td>
                                                <td className="px-6 py-4 uppercase font-black text-[10px] tracking-widest">{h.reportType.replace('-', ' ')}</td>
                                                <td className="px-6 py-4 uppercase font-bold text-emerald-600">{h.format}</td>
                                                <td className="px-6 py-4 text-slate-500">{h.fileName}</td>
                                                <td className="px-6 py-4 text-right">{(h.fileSize / 1024).toFixed(1)} KB</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
