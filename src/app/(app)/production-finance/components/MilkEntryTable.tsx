import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, Calendar as CalendarIcon, Users, User, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { cowsApi } from '@/lib/api/cows';
import { milkRecordsApi } from '@/lib/api/milk-records';
import { cn } from '@/lib/utils';

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
  
  // Bulk Mode States
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkAm, setBulkAm] = useState('');
  const [bulkPm, setBulkPm] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('45'); // Default price
  const [fat, setFat] = useState('');
  const [snf, setSnf] = useState('');
  const [bulkSelectionMode, setBulkSelectionMode] = useState<'all' | 'selected'>('all');
  const [selectedCowIds, setSelectedCowIds] = useState<Set<string>>(new Set());

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('milk_bulk_selection_mode');
    const savedIds = localStorage.getItem('milk_bulk_selected_ids');
    const savedPrice = localStorage.getItem('milk_price_per_liter');
    
    if (savedMode === 'all' || savedMode === 'selected') {
      setBulkSelectionMode(savedMode);
    }
    
    if (savedPrice) {
      setPricePerLiter(savedPrice);
    }
    
    if (savedIds) {
      try {
        const ids = JSON.parse(savedIds);
        if (Array.isArray(ids)) {
          setSelectedCowIds(new Set(ids));
        }
      } catch (e) {
        console.error('Failed to parse saved cow IDs');
      }
    }
  }, []);

  // Save preferences whenever they change
  useEffect(() => {
    localStorage.setItem('milk_bulk_selection_mode', bulkSelectionMode);
    localStorage.setItem('milk_bulk_selected_ids', JSON.stringify(Array.from(selectedCowIds)));
    localStorage.setItem('milk_price_per_liter', pricePerLiter);
  }, [bulkSelectionMode, selectedCowIds, pricePerLiter]);

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

        // If we have saved IDs, filter them to make sure they still exist in active cows
        // Otherwise, if it's the first time and mode is 'all', select all
        setSelectedCowIds(prev => {
          if (prev.size > 0) {
            const validIds = new Set<string>();
            activeFemales.forEach(c => {
              if (prev.has(c.id)) validIds.add(c.id);
            });
            return validIds.size > 0 ? validIds : new Set(activeFemales.map(c => c.id));
          }
          return new Set(activeFemales.map(c => c.id));
        });
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

  const toggleCowSelection = (cowId: string) => {
    const newSelection = new Set(selectedCowIds);
    if (newSelection.has(cowId)) {
      newSelection.delete(cowId);
    } else {
      newSelection.add(cowId);
    }
    setSelectedCowIds(newSelection);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const price = parseFloat(pricePerLiter) || 0;
      
      if (isBulkMode) {
        // Handle Bulk Save
        const recordsToSave: any[] = [];
        const cowCount = bulkSelectionMode === 'all' ? cows.length : selectedCowIds.size;
        
        if (cowCount === 0) {
          toast.error('Please select at least one cow for bulk entry.');
          setIsSaving(false);
          return;
        }

        const notes = bulkSelectionMode === 'all' 
          ? `Bulk entry for all ${cows.length} cows` 
          : `Bulk entry for ${selectedCowIds.size} selected cows: ${Array.from(selectedCowIds).map(id => cows.find(c => c.id === id)?.tagId).join(', ')}`;

        if (bulkAm && parseFloat(bulkAm) > 0) {
          recordsToSave.push({
            date,
            milkingTime: 'AM',
            amount: parseFloat(bulkAm),
            isBulk: true,
            notes,
            pricePerLiter: price,
            fat: parseFloat(fat) || null,
            snf: parseFloat(snf) || null,
          });
        }
        
        if (bulkPm && parseFloat(bulkPm) > 0) {
          recordsToSave.push({
            date,
            milkingTime: 'PM',
            amount: parseFloat(bulkPm),
            isBulk: true,
            notes,
            pricePerLiter: price,
            fat: parseFloat(fat) || null,
            snf: parseFloat(snf) || null,
          });
        }

        if (recordsToSave.length === 0) {
          toast.error('Please enter AM or PM bulk amount.');
          setIsSaving(false);
          return;
        }

        await milkRecordsApi.createBulkMilkRecords({ records: recordsToSave });
      } else {
        // Handle Individual Save
        const recordsToSave: any[] = [];

        Object.entries(entries).forEach(([cowId, values]) => {
          if (values.am && parseFloat(values.am) > 0) {
            recordsToSave.push({
              cowId,
              date,
              milkingTime: 'AM',
              amount: parseFloat(values.am),
              pricePerLiter: price,
              fat: parseFloat(fat) || null,
              snf: parseFloat(snf) || null,
            });
          }
          if (values.pm && parseFloat(values.pm) > 0) {
            recordsToSave.push({
              cowId,
              date,
              milkingTime: 'PM',
              amount: parseFloat(values.pm),
              pricePerLiter: price,
              fat: parseFloat(fat) || null,
              snf: parseFloat(snf) || null,
            });
          }
        });

        if (recordsToSave.length === 0) {
          toast.error('Please enter at least one milk record.');
          setIsSaving(false);
          return;
        }

        await milkRecordsApi.createBulkMilkRecords({ records: recordsToSave });
      }

      toast.success('Milk records saved successfully!');
      onSuccess?.();
      
      if (isBulkMode) {
        setBulkAm('');
        setBulkPm('');
      }
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

  const totalBulkLiters = (parseFloat(bulkAm) || 0) + (parseFloat(bulkPm) || 0);
  const totalBulkValue = totalBulkLiters * (parseFloat(pricePerLiter) || 0);

  return (
    <Card id="milk-entry-table" className="bg-white dark:bg-slate-800/50 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/50 pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Milk Entry</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Record milk production for today or a specific date</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Price per Liter Input */}
          {/* Fat/SNF Inputs */}
          <div className="flex items-center bg-blue-50 dark:bg-blue-900/10 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center border-r border-blue-100 dark:border-blue-800 pr-2 mr-2">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase mr-2 tracking-tighter">FAT</span>
              <Input 
                type="number" 
                step="0.1"
                value={fat} 
                onChange={(e) => setFat(e.target.value)}
                className="bg-transparent border-none text-sm font-bold w-10 h-auto p-0 focus-visible:ring-0 text-blue-700 dark:text-blue-300"
              />
            </div>
            <div className="flex items-center">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase mr-2 tracking-tighter">SNF</span>
              <Input 
                type="number" 
                step="0.1"
                value={snf} 
                onChange={(e) => setSnf(e.target.value)}
                className="bg-transparent border-none text-sm font-bold w-10 h-auto p-0 focus-visible:ring-0 text-blue-700 dark:text-blue-300"
              />
            </div>
          </div>

          <div className="flex items-center bg-amber-50 dark:bg-amber-900/10 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase mr-2 tracking-tighter">Price / L</span>
            <Input 
              type="number" 
              value={pricePerLiter} 
              onChange={(e) => setPricePerLiter(e.target.value)}
              className="bg-transparent border-none text-sm font-bold w-16 h-auto p-0 focus-visible:ring-0 text-amber-700 dark:text-amber-300"
            />
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setIsBulkMode(false)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                !isBulkMode ? "bg-white dark:bg-slate-800 shadow-sm text-emerald-600" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <List className="h-3.5 w-3.5" />
              Individual
            </button>
            <button
              onClick={() => setIsBulkMode(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                isBulkMode ? "bg-white dark:bg-slate-800 shadow-sm text-emerald-600" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Bulk / Combined
            </button>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <CalendarIcon className="h-4 w-4 mr-2 text-slate-500" />
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none text-sm font-medium focus:outline-none text-slate-700 dark:text-slate-300"
            />
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving || cows.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-200 dark:shadow-none"
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save {isBulkMode ? 'Bulk' : 'Records'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isBulkMode ? (
          <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <Users className="h-4 w-4 text-emerald-600" />
                    </div>
                    Total Quantity (Liters)
                  </h4>
                  {totalBulkValue > 0 && (
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                      ≈ ₹{totalBulkValue.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Morning (AM)</label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder="0.0" 
                      value={bulkAm}
                      onChange={(e) => setBulkAm(e.target.value)}
                      className="text-lg font-bold h-12 rounded-xl focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Evening (PM)</label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder="0.0" 
                      value={bulkPm}
                      onChange={(e) => setBulkPm(e.target.value)}
                      className="text-lg font-bold h-12 rounded-xl focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <LayoutGrid className="h-4 w-4 text-blue-600" />
                  </div>
                  Target Selection
                </h4>
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => setBulkSelectionMode('all')}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                      bulkSelectionMode === 'all' 
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 text-blue-700 dark:text-blue-400" 
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                    )}
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-xs font-bold">All {cows.length} Cows</span>
                  </button>
                  <button
                    onClick={() => setBulkSelectionMode('selected')}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                      bulkSelectionMode === 'selected' 
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 text-blue-700 dark:text-blue-400" 
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                    )}
                  >
                    <User className="h-5 w-5" />
                    <span className="text-xs font-bold">Selected Subset</span>
                  </button>
                </div>
              </div>
            </div>

            {bulkSelectionMode === 'selected' && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Select Cows Included:</h4>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                    {selectedCowIds.size} of {cows.length} selected
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {cows.map(cow => (
                    <div 
                      key={cow.id}
                      onClick={() => toggleCowSelection(cow.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                        selectedCowIds.has(cow.id)
                          ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                          : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-200"
                      )}
                    >
                      <Checkbox 
                        checked={selectedCowIds.has(cow.id)} 
                        onCheckedChange={() => {}} // handled by div click
                        className="pointer-events-none"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-100">{cow.name || 'Unnamed'}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{cow.tagId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto animate-in fade-in slide-in-from-bottom-1 duration-300">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
                  <TableHead className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">Cow Details</TableHead>
                  <TableHead className="w-28 text-center font-bold text-slate-700 dark:text-slate-300">Morning (AM)</TableHead>
                  <TableHead className="w-28 text-center font-bold text-slate-700 dark:text-slate-300">Evening (PM)</TableHead>
                  <TableHead className="w-32 text-right py-4 px-6 font-bold text-slate-700 dark:text-slate-300">Est. Value (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-slate-500 font-medium italic">
                      No active female cows found. Add cows to start recording milk.
                    </TableCell>
                  </TableRow>
                ) : (
                  cows.map((cow) => {
                    const am = parseFloat(entries[cow.id]?.am) || 0;
                    const pm = parseFloat(entries[cow.id]?.pm) || 0;
                    const total = am + pm;
                    const value = total * (parseFloat(pricePerLiter) || 0);
                    return (
                      <TableRow key={cow.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <TableCell className="py-4 px-6">
                          <p className="font-bold text-slate-900 dark:text-slate-100">{cow.name || 'Unnamed Cow'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                              {cow.tagId}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Input 
                            type="number" 
                            step="0.1"
                            min="0"
                            placeholder="0.0" 
                            className="w-24 mx-auto text-center font-bold h-10 rounded-lg focus:ring-emerald-500 border-slate-200 dark:border-slate-700" 
                            value={entries[cow.id]?.am || ''}
                            onChange={(e) => handleInputChange(cow.id, 'am', e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input 
                            type="number" 
                            step="0.1"
                            min="0"
                            placeholder="0.0" 
                            className="w-24 mx-auto text-center font-bold h-10 rounded-lg focus:ring-emerald-500 border-slate-200 dark:border-slate-700" 
                            value={entries[cow.id]?.pm || ''}
                            onChange={(e) => handleInputChange(cow.id, 'pm', e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-right py-4 px-6">
                          <div className="flex flex-col items-end">
                            <span className={cn(
                              "text-sm font-black tracking-tighter",
                              value > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-300 dark:text-slate-700"
                            )}>
                              ₹{value.toFixed(1)}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                              {total.toFixed(1)} Liters
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


