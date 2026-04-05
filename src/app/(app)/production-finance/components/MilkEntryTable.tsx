import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cowsApi } from '@/lib/api/cows';
import { milkRecordsApi } from '@/lib/api/milk-records';

interface CowEntry {
  id: string;
  name: string | null;
  tagId: string;
}

export function MilkEntryTable({ onSuccess }: { onSuccess?: () => void }) {
  const [cows, setCows] = useState<CowEntry[]>([]);
  const [entries, setEntries] = useState<Record<string, { am: string; pm: string }>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchCows() {
      try {
        setIsLoading(true);
        const activeFemales = await cowsApi.getActiveFemales();
        setCows(activeFemales);
        
        // Initialize entries
        const initialEntries: Record<string, { am: string; pm: string }> = {};
        activeFemales.forEach(cow => {
          initialEntries[cow.id] = { am: '', pm: '' };
        });
        setEntries(initialEntries);
      } catch (error) {
        console.error('Failed to fetch cows for milk entry:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCows();
  }, []);

  const handleInputChange = (cowId: string, type: 'am' | 'pm', value: string) => {
    setEntries(prev => ({
      ...prev,
      [cowId]: {
        ...prev[cowId],
        [type]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const recordsToSave: any[] = [];

      Object.entries(entries).forEach(([cowId, values]) => {
        if (values.am && parseFloat(values.am) > 0) {
          recordsToSave.push({
            cowId,
            date,
            milkingTime: 'AM',
            amount: parseFloat(values.am),
          });
        }
        if (values.pm && parseFloat(values.pm) > 0) {
          recordsToSave.push({
            cowId,
            date,
            milkingTime: 'PM',
            amount: parseFloat(values.pm),
          });
        }
      });

      if (recordsToSave.length === 0) {
        toast.error('Please enter at least one milk record.');
        return;
      }

      await milkRecordsApi.createBulkMilkRecords({ records: recordsToSave });
      toast.success('Milk records saved successfully!');
      onSuccess?.();
      
      // Optionally clear entries if needed, or keep for review
    } catch (error: any) {
      console.error('Failed to save milk records:', error);
      toast.error(error.response?.data?.message || 'Failed to save records. Please check for duplicates or errors.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-slate-800/50 shadow-sm animate-pulse">
        <CardHeader>
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </CardHeader>
        <CardContent className="h-48"></CardContent>
      </Card>
    );
  }

  return (
    <Card id="milk-entry-table" className="bg-white dark:bg-slate-800/50 shadow-sm">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Daily Milk Entry</CardTitle>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <CalendarIcon className="h-4 w-4 mr-2 text-slate-500" />
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none text-sm focus:outline-none text-slate-700 dark:text-slate-300"
            />
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || cows.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Records
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {cows.length === 0 ? (
          <p className="text-center py-8 text-slate-500">No active female cows found.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cow</TableHead>
                  <TableHead className="w-24 text-center">AM (L)</TableHead>
                  <TableHead className="w-24 text-center">PM (L)</TableHead>
                  <TableHead className="w-24 text-right">Total (L)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cows.map((cow) => {
                  const am = parseFloat(entries[cow.id]?.am) || 0;
                  const pm = parseFloat(entries[cow.id]?.pm) || 0;
                  const total = am + pm;
                  return (
                    <TableRow key={cow.id}>
                      <TableCell>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{cow.name || 'Unnamed'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{cow.tagId}</p>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          step="0.1"
                          min="0"
                          placeholder="0.0" 
                          className="w-20 mx-auto text-center" 
                          value={entries[cow.id]?.am || ''}
                          onChange={(e) => handleInputChange(cow.id, 'am', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          step="0.1"
                          min="0"
                          placeholder="0.0" 
                          className="w-20 mx-auto text-center" 
                          value={entries[cow.id]?.pm || ''}
                          onChange={(e) => handleInputChange(cow.id, 'pm', e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{total.toFixed(1)}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
