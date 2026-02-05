import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function FinancialTransactionForm() {
  return (
    <Card className="bg-white dark:bg-slate-800/50 shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Log Financial Transaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="transaction-type">Transaction Type</Label>
            <Select>
              <SelectTrigger id="transaction-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {/* These should be dynamically populated based on transaction type */}
                <SelectItem value="milk-sales">Milk Sales</SelectItem>
                <SelectItem value="cow-sales">Cow Sales</SelectItem>
                <SelectItem value="feed">Feed</SelectItem>
                <SelectItem value="veterinary">Veterinary</SelectItem>
                <SelectItem value="labor">Labor</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount (INR)</Label>
            <Input id="amount" type="number" placeholder="e.g., 5000" />
          </div>
          <div>
            <Label htmlFor="date">Transaction Date</Label>
            <Input id="date" type="date" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button>Save Transaction</Button>
        </div>
      </CardContent>
    </Card>
  );
}
