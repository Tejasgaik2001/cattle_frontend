import type { HealthBreedingOverview } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Baby, Activity, ShieldCheck } from 'lucide-react'; // Using icons for metrics

interface HealthBreedingOverviewCardProps {
  overview: HealthBreedingOverview;
  onViewFilteredHerd?: (filterType: 'underTreatment' | 'pregnant' | 'healthIssuesRecent' | 'vaccinationsDueOverdue') => void;
}

export function HealthBreedingOverviewCard({ overview, onViewFilteredHerd }: HealthBreedingOverviewCardProps) {
  const overviewItems = [
    { key: 'cowsUnderTreatment', label: 'Cows Under Treatment', icon: Stethoscope, filterType: 'underTreatment' },
    { key: 'pregnantCows', label: 'Pregnant Cows', icon: Baby, filterType: 'pregnant' },
    { key: 'healthIssuesLast7Days', label: 'Health Issues (7d)', icon: Activity, filterType: 'healthIssuesRecent' },
    { key: 'vaccinationsDueOverdueCount', label: 'Vaccinations Due', icon: ShieldCheck, filterType: 'vaccinationsDueOverdue' },
  ];

  return (
    <Card className="bg-white dark:bg-slate-800/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Health & Breeding Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overviewItems.map((item) => (
          <div
            key={item.key}
            onClick={() => onViewFilteredHerd?.(item.filterType as any)}
            className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <item.icon className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{overview[item.key as keyof HealthBreedingOverview]}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">{item.label}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
