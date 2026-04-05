import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { financialApi } from '@/lib/api/financial';
import { cowsApi } from '@/lib/api/cows';
import { getFarmId } from '@/lib/farm';

const categories = {
  income: ['Milk Sales', 'Cow Sales', 'Other Income'],
  expense: ['Feed', 'Veterinary', 'Labor', 'Utilities', 'Maintenance', 'Breeding / AI', 'Other'],
};

export function FinancialTransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [cowId, setCowId] = useState<string | undefined>(undefined);
  const [cows, setCows] = useState<{ id: string; tagId: string; name: string | null }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchCows() {
      try {
        const activeFemales = await cowsApi.getActiveFemales();
        setCows(activeFemales);
      } catch (error) {
        console.error('Failed to fetch cows for transaction form:', error);
      }
    }
    fetchCows();
  }, []);

  const handleSubmit = async () => {
    if (!category || !amount || !date) {
      toast.error('Please fill in all required fields (Category, Amount, Date).');
      return;
    }

    try {
      setIsSaving(true);
      const farmId = await getFarmId();
      await financialApi.createTransaction(farmId, {
        type,
        category,
        amount: parseFloat(amount),
        date,
        description,
        cowId: cowId === 'none' ? undefined : cowId,
      });

      toast.success('Transaction logged successfully!');
      onSuccess?.();
      // Reset form
      setAmount('');
      setDescription('');
      setCowId(undefined);
    } catch (error: any) {
      console.error('Failed to save transaction:', error);
      toast.error(error.response?.data?.message || 'Failed to save transaction. Please check your inputs.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card id="financial-transaction-form" className="bg-white dark:bg-slate-800/50 shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Log Financial Transaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transaction-type">Transaction Type</Label>
            <Select value={type} onValueChange={(val: any) => { setType(val); setCategory(''); }}>
              <SelectTrigger id="transaction-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories[type].map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (INR)</Label>
            <Input 
              id="amount" 
              type="number" 
              placeholder="e.g., 5000" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Transaction Date</Label>
            <Input 
              id="date" 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cow-select">Related Cow (Optional)</Label>
            <Select value={cowId} onValueChange={setCowId}>
              <SelectTrigger id="cow-select">
                <SelectValue placeholder="Select cow (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {cows.map((cow) => (
                  <SelectItem key={cow.id} value={cow.id}>
                    {cow.name || 'Unnamed'} ({cow.tagId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input 
              id="description" 
              placeholder="e.g., Purchased 2 bags of specialized feed" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
            Save Transaction
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
