import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Mock data for initial display
const mockCows = [
  { id: 'cow-101', name: 'Gauri', tagId: 'MH-00101', am: '', pm: '' },
  { id: 'cow-102', name: 'Ganga', tagId: 'MH-00102', am: '', pm: '' },
  { id: 'cow-103', name: 'Laxmi', tagId: 'MH-00103', am: '', pm: '' },
  { id: 'cow-104', name: 'Sita', tagId: 'MH-00104', am: '', pm: '' },
  { id: 'cow-105', name: 'Radha', tagId: 'MH-00105', am: '', pm: '' },
];

export function MilkEntryTable() {
  return (
    <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Daily Milk Entry</CardTitle>
        <Button size="sm">Save Records</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cow</TableHead>
              <TableHead className="w-24">AM (L)</TableHead>
              <TableHead className="w-24">PM (L)</TableHead>
              <TableHead className="w-24 text-right">Total (L)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCows.map((cow) => {
              const am = parseFloat(cow.am) || 0;
              const pm = parseFloat(cow.pm) || 0;
              const total = am + pm;
              return (
                <TableRow key={cow.id}>
                  <TableCell>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{cow.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{cow.tagId}</p>
                  </TableCell>
                  <TableCell>
                    <Input type="number" placeholder="0.0" className="w-20" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" placeholder="0.0" className="w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{total.toFixed(1)}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
