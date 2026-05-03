import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, Edit2, Save, X, Info } from 'lucide-react';
import { toast } from 'sonner';
import { milkRecordsApi } from '@/lib/api/milk-records';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MilkRecord {
  id: string;
  date: string;
  milkingTime: 'AM' | 'PM';
  amount: number;
  pricePerLiter: number | null;
  dairyAmount: number | null;
  dairyPricePerLiter: number | null;
  isReconciled: boolean;
  isBulk: boolean;
  notes: string | null;
  cow?: {
    name: string | null;
    tagId: string;
  } | null;
}

export function MilkHistory() {
  const [records, setRecords] = useState<MilkRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    dairyAmount: string;
    dairyPricePerLiter: string;
    isReconciled: boolean;
  }>({
    dairyAmount: '',
    dairyPricePerLiter: '',
    isReconciled: true,
  });

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const response = await milkRecordsApi.getMilkRecords({ take: 20 } as any);
      setRecords(response.data);
    } catch (error) {
      console.error('Failed to fetch milk history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const startEditing = (record: MilkRecord) => {
    setEditingId(record.id);
    setEditValues({
      dairyAmount: record.dairyAmount?.toString() || record.amount.toString(),
      dairyPricePerLiter: record.dairyPricePerLiter?.toString() || record.pricePerLiter?.toString() || '',
      isReconciled: true,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleSave = async (id: string) => {
    try {
      await milkRecordsApi.updateMilkRecord(id, {
        dairyAmount: parseFloat(editValues.dairyAmount),
        dairyPricePerLiter: parseFloat(editValues.dairyPricePerLiter),
        isReconciled: editValues.isReconciled,
      });
      toast.success('Record reconciled successfully');
      setEditingId(null);
      fetchRecords();
    } catch (error) {
      toast.error('Failed to update record');
    }
  };

  if (isLoading && records.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800/50 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Recent Production History</CardTitle>
            <p className="text-xs text-slate-500 mt-1">Reconcile farm readings with dairy confirmations</p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchRecords} className="text-slate-500 hover:text-emerald-600">
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableHead className="font-bold">Date / Session</TableHead>
                <TableHead className="font-bold">Target</TableHead>
                <TableHead className="font-bold text-center">Farm Reading</TableHead>
                <TableHead className="font-bold text-center bg-amber-50/30 dark:bg-amber-900/10">Dairy Reading (Final)</TableHead>
                <TableHead className="font-bold text-right">Status</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500 italic">
                    No production history found.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => {
                  const isEditing = editingId === record.id;
                  const finalAmount = record.isReconciled ? record.dairyAmount : record.amount;
                  const finalPrice = record.isReconciled ? record.dairyPricePerLiter : record.pricePerLiter;
                  const finalValue = (finalAmount || 0) * (finalPrice || 0);

                  return (
                    <TableRow key={record.id} className={cn(
                      "group transition-colors",
                      record.isReconciled ? "bg-emerald-50/10" : "bg-transparent"
                    )}>
                      <TableCell className="py-4">
                        <p className="font-bold text-slate-900 dark:text-white">{format(new Date(record.date), 'MMM dd, yyyy')}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{record.milkingTime} Session</p>
                      </TableCell>
                      
                      <TableCell>
                        {record.isBulk ? (
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800 text-[10px]">Bulk</Badge>
                            {record.notes && (
                              <Info className="h-3 w-3 text-slate-400 cursor-help" title={record.notes} />
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-bold">{record.cow?.name || 'Unnamed'}</p>
                            <p className="text-[10px] text-slate-500">{record.cow?.tagId}</p>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{record.amount} L</span>
                          <span className="text-[9px] font-medium text-slate-400">@ ₹{record.pricePerLiter || '-'}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-center bg-amber-50/20 dark:bg-amber-900/5">
                        {isEditing ? (
                          <div className="flex flex-col gap-2 min-w-[120px] mx-auto">
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-black text-amber-600 w-4">L:</span>
                              <Input 
                                size={1}
                                className="h-7 text-xs font-bold py-0" 
                                value={editValues.dairyAmount}
                                onChange={e => setEditValues({...editValues, dairyAmount: e.target.value})}
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-black text-amber-600 w-4">₹:</span>
                              <Input 
                                size={1}
                                className="h-7 text-xs font-bold py-0" 
                                value={editValues.dairyPricePerLiter}
                                onChange={e => setEditValues({...editValues, dairyPricePerLiter: e.target.value})}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            {record.isReconciled ? (
                              <>
                                <span className="text-sm font-black text-amber-600 dark:text-amber-400">{record.dairyAmount} L</span>
                                <span className="text-[9px] font-black text-emerald-600 tracking-tight">₹{finalValue.toFixed(1)}</span>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Pending...</span>
                            )}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {record.isReconciled ? (
                          <div className="flex items-center justify-end gap-1 text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1 text-amber-500">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Farm Only</span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {isEditing ? (
                            <>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 text-emerald-600 hover:bg-emerald-50"
                                onClick={() => handleSave(record.id)}
                              >
                                <Save className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 text-red-500 hover:bg-red-50"
                                onClick={cancelEditing}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7 text-slate-400 hover:text-emerald-600 group-hover:bg-slate-100 dark:group-hover:bg-slate-800"
                              onClick={() => startEditing(record)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
