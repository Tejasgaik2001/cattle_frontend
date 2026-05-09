import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, Edit2, Save, X, Info, Droplets, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { milkRecordsApi } from '@/lib/api/milk-records';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface MilkRecord {
  id: string;
  date: string;
  milkingTime: 'AM' | 'PM';
  amount: number;
  pricePerLiter: number | null;
  dairyAmount: number | null;
  dairyPricePerLiter: number | null;
  fat: number | null;
  snf: number | null;
  dairyFat: number | null;
  dairySnf: number | null;
  isReconciled: boolean;
  isBulk: boolean;
  notes: string | null;
  cow?: {
    name: string | null;
    tagId: string;
  } | null;
}

interface MilkHistoryProps {
  lastUpdated?: number;
  onSuccess?: () => void;
}

export function MilkHistory({ lastUpdated, onSuccess }: MilkHistoryProps) {
  const [records, setRecords] = useState<MilkRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    dairyAmount: string;
    dairyPricePerLiter: string;
    dairyFat: string;
    dairySnf: string;
    isReconciled: boolean;
  }>({
    dairyAmount: '',
    dairyPricePerLiter: '',
    dairyFat: '',
    dairySnf: '',
    isReconciled: true,
  });

  const fetchRecords = async (targetPage = page) => {
    try {
      setIsLoading(true);
      const response = await milkRecordsApi.getMilkRecords({ 
        limit, 
        page: targetPage 
      } as any);
      
      const recordArray = Array.isArray(response) ? response : (response?.data || []);
      const totalCount = Array.isArray(response) ? response.length : (response?.total || 0);
      
      setRecords(recordArray);
      setTotal(totalCount);
    } catch (error) {
      console.error('Failed to fetch milk history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(1);
    setPage(1);
  }, [lastUpdated]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchRecords(newPage);
  };

  const handleSave = async (id: string) => {
    try {
      await milkRecordsApi.updateMilkRecord(id, {
        dairyAmount: parseFloat(editValues.dairyAmount),
        dairyPricePerLiter: parseFloat(editValues.dairyPricePerLiter),
        dairyFat: parseFloat(editValues.dairyFat),
        dairySnf: parseFloat(editValues.dairySnf),
        isReconciled: editValues.isReconciled,
      });
      toast.success('Record reconciled successfully');
      setEditingId(null);
      fetchRecords(page);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to update record');
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  // Group and aggregate records by date and session
  const groupedRecords = (Array.isArray(records) ? records : []).reduce((groups: Record<string, Record<string, any>>, record) => {
    const dateKey = typeof record.date === 'string' ? record.date.split('T')[0] : format(new Date(record.date), 'yyyy-MM-dd');
    const sessionKey = record.milkingTime;
    
    if (!groups[dateKey]) {
      groups[dateKey] = { AM: null, PM: null };
    }
    
    const current = groups[dateKey][sessionKey] || {
        ids: [],
        amount: 0,
        pricePerLiter: 0,
        fat: 0,
        snf: 0,
        dairyAmount: 0,
        dairyPricePerLiter: 0,
        dairyFat: 0,
        dairySnf: 0,
        isReconciled: true,
        count: 0,
        reconciledCount: 0,
        milkingTime: sessionKey,
        date: dateKey,
        isBulk: false
    };

    current.ids.push(record.id);
    current.amount += Number(record.amount || 0);
    current.dairyAmount += record.isReconciled ? Number(record.dairyAmount || 0) : 0;
    
    if (record.isBulk) {
        current.isBulk = true;
        current.pricePerLiter = Number(record.pricePerLiter || 0);
        current.fat = Number(record.fat || 0);
        current.snf = Number(record.snf || 0);
        current.dairyPricePerLiter = Number(record.dairyPricePerLiter || record.pricePerLiter || 0);
        current.dairyFat = Number(record.dairyFat || 0);
        current.dairySnf = Number(record.dairySnf || 0);
    } else if (!current.isBulk) {
        const p = Number(record.pricePerLiter || 0);
        const f = Number(record.fat || 0);
        const s = Number(record.snf || 0);
        
        current.pricePerLiter = (current.pricePerLiter * current.count + p) / (current.count + 1);
        current.fat = (current.fat * current.count + f) / (current.count + 1);
        current.snf = (current.snf * current.count + s) / (current.count + 1);
        
        if (record.isReconciled) {
            const dp = Number(record.dairyPricePerLiter || record.pricePerLiter || 0);
            const df = Number(record.dairyFat || 0);
            const ds = Number(record.dairySnf || 0);
            
            current.dairyPricePerLiter = (current.dairyPricePerLiter * current.reconciledCount + dp) / (current.reconciledCount + 1);
            current.dairyFat = (current.dairyFat * current.reconciledCount + df) / (current.reconciledCount + 1);
            current.dairySnf = (current.dairySnf * current.reconciledCount + ds) / (current.reconciledCount + 1);
        }
    }

    if (!record.isReconciled) current.isReconciled = false;
    current.count++;
    if (record.isReconciled) current.reconciledCount++;

    groups[dateKey][sessionKey] = current;
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedRecords).sort((a, b) => b.localeCompare(a));

  const safeFixed = (val: any, d = 1) => {
    const n = Number(val);
    return isNaN(n) ? '0.0' : n.toFixed(d);
  };

  const startEditingSession = (sessionData: any) => {
    const idToEdit = sessionData.ids[0];
    setEditingId(idToEdit);
    setEditValues({
      dairyAmount: (sessionData.dairyAmount || sessionData.amount).toFixed(1),
      dairyPricePerLiter: (sessionData.dairyPricePerLiter || sessionData.pricePerLiter || 0).toFixed(1),
      dairyFat: (sessionData.dairyFat || sessionData.fat || 0).toFixed(1),
      dairySnf: (sessionData.dairySnf || sessionData.snf || 0).toFixed(1),
      isReconciled: true,
    });
  };

  if (isLoading && records.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800/50 shadow-sm overflow-hidden" id="milk-history-section">
      <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Milk Production History</CardTitle>
            <p className="text-xs text-slate-500 mt-1">Session summaries (Individual cow records are in Cow Details)</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchRecords(page)} className="h-8 text-xs font-bold gap-2">
              <Loader2 className={cn("h-3 w-3", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <TableHead className="font-bold w-40">Session</TableHead>
                <TableHead className="font-bold">Entry Details</TableHead>
                <TableHead className="font-bold text-center">Farm Total</TableHead>
                <TableHead className="font-bold text-center bg-amber-50/30 dark:bg-amber-900/10">Dairy Confirmation</TableHead>
                <TableHead className="font-bold text-right">Value (₹)</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <AlertCircle className="h-8 w-8 opacity-20" />
                        <p className="text-sm font-medium italic">No production history found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedDates.map((dateStr) => {
                    const sessions = groupedRecords[dateStr];
                    const daySessions = ['AM', 'PM'].map(time => sessions[time]).filter(Boolean);

                    return (
                        <React.Fragment key={dateStr}>
                            <TableRow className="bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
                                <TableCell colSpan={6} className="py-2.5 px-6">
                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                                        📅 {format(parseISO(dateStr), 'EEEE, MMMM dd, yyyy')}
                                    </span>
                                </TableCell>
                            </TableRow>
                            {daySessions.map((session) => {
                                const isEditing = session.ids.some((id: string) => editingId === id);
                                const finalAmount = session.isReconciled ? session.dairyAmount : session.amount;
                                const finalPrice = session.isReconciled ? (session.dairyPricePerLiter || session.pricePerLiter) : session.pricePerLiter;
                                const finalValue = (finalAmount || 0) * (finalPrice || 0);

                                return (
                                    <TableRow key={`${dateStr}-${session.milkingTime}`} className={cn(
                                        "group transition-colors",
                                        session.isReconciled ? "bg-emerald-50/5" : "bg-transparent",
                                        "hover:bg-slate-50/80 dark:hover:bg-slate-900/30"
                                    )}>
                                        <TableCell className="py-4 pl-10">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-1.5 h-8 rounded-full",
                                                    session.milkingTime === 'AM' ? "bg-amber-400" : "bg-indigo-500"
                                                )} />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{session.milkingTime} Session</p>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase">{session.count} Records Combined</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] font-black uppercase",
                                                    session.isBulk ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 text-slate-500 border-slate-100"
                                                )}>
                                                    {session.isBulk ? 'Bulk Entry' : 'Individual Records'}
                                                </Badge>
                                                {session.isReconciled && (
                                                     <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-black uppercase">Settled</Badge>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{safeFixed(session.amount)} L</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-slate-400 tracking-tighter">Avg ₹{safeFixed(session.pricePerLiter)}/L</span>
                                                    <span className="text-[10px] font-black text-blue-500/80 px-1.5 rounded-md bg-blue-50 dark:bg-blue-900/10">F:{safeFixed(session.fat)} S:{safeFixed(session.snf)}</span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center bg-amber-50/10 dark:bg-amber-900/5">
                                            {isEditing ? (
                                            <div className="flex flex-col gap-2 min-w-[200px] mx-auto p-2 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-xl scale-110 origin-center z-10 relative">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] font-black text-amber-600 uppercase flex items-center gap-1">
                                                            <Droplets className="h-2.5 w-2.5" /> Liters
                                                        </span>
                                                        <Input 
                                                            className="h-8 text-xs font-bold px-2 focus-visible:ring-amber-500" 
                                                            value={editValues.dairyAmount}
                                                            onChange={e => setEditValues({...editValues, dairyAmount: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] font-black text-emerald-600 uppercase flex items-center gap-1">
                                                            ₹ Rate
                                                        </span>
                                                        <Input 
                                                            className="h-8 text-xs font-bold px-2 focus-visible:ring-emerald-500" 
                                                            value={editValues.dairyPricePerLiter}
                                                            onChange={e => setEditValues({...editValues, dairyPricePerLiter: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] font-black text-blue-500 uppercase">Fat %</span>
                                                        <Input 
                                                            className="h-8 text-xs font-bold px-2 focus-visible:ring-blue-500" 
                                                            value={editValues.dairyFat}
                                                            onChange={e => setEditValues({...editValues, dairyFat: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] font-black text-blue-500 uppercase">SNF %</span>
                                                        <Input 
                                                            className="h-8 text-xs font-bold px-2 focus-visible:ring-blue-500" 
                                                            value={editValues.dairySnf}
                                                            onChange={e => setEditValues({...editValues, dairySnf: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            ) : (
                                            <div className="flex flex-col items-center">
                                                {session.isReconciled ? (
                                                <>
                                                    <span className="text-sm font-black text-amber-600 dark:text-amber-400">{safeFixed(session.dairyAmount)} L</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-bold text-emerald-600 tracking-tighter">₹{safeFixed(session.dairyPricePerLiter || session.pricePerLiter)}/L</span>
                                                        <span className="text-[10px] font-black text-blue-600 bg-blue-100/50 dark:bg-blue-900/30 px-1.5 rounded-md">F:{safeFixed(session.dairyFat)} S:{safeFixed(session.snf)}</span>
                                                    </div>
                                                </>
                                                ) : (
                                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase bg-slate-100 dark:bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                                    <Clock className="h-3 w-3 text-amber-500" />
                                                    Pending Dairy Receipt
                                                </div>
                                                )}
                                            </div>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={cn(
                                                    "text-sm font-black tracking-tighter",
                                                    session.isReconciled ? "text-emerald-600" : "text-slate-400"
                                                )}>
                                                    ₹{finalValue.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                                </span>
                                                {session.isReconciled && (
                                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Session Total</span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1">
                                            {isEditing ? (
                                                <>
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                                                    onClick={() => handleSave(editingId!)}
                                                >
                                                    <Save className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-xl"
                                                    onClick={cancelEditing}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                                </>
                                            ) : (
                                                <Button 
                                                    size="sm" 
                                                    variant={session.isReconciled ? "ghost" : "outline"} 
                                                    className={cn(
                                                        "h-8 gap-1.5 rounded-xl px-3 transition-all",
                                                        session.isReconciled 
                                                            ? "text-slate-400 opacity-0 group-hover:opacity-100" 
                                                            : "text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100 opacity-100"
                                                    )}
                                                    onClick={() => startEditingSession(session)}
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                    <span className="text-[10px] font-black uppercase">
                                                        {session.isReconciled ? 'Edit' : 'Confirm Receipt'}
                                                    </span>
                                                </Button>
                                            )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </React.Fragment>
                    );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {total > limit && (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/20">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Showing {records.length} of {total} records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || isLoading}
              onClick={() => handlePageChange(page - 1)}
              className="h-8 px-3 text-[10px] font-black uppercase rounded-xl border-slate-200 dark:border-slate-800"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1 mx-2">
                <span className="text-[10px] font-black text-emerald-600 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">{page}</span>
                <span className="text-[10px] font-black text-slate-300">/</span>
                <span className="text-[10px] font-black text-slate-400">{Math.ceil(total / limit)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page * limit >= total || isLoading}
              onClick={() => handlePageChange(page + 1)}
              className="h-8 px-3 text-[10px] font-black uppercase rounded-xl border-slate-200 dark:border-slate-800"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
