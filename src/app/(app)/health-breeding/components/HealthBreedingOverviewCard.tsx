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
    <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
      <CardHeader className="pb-4 bg-slate-50/30 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Health & Breeding Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {overviewItems.map((item) => (
          <div
            key={item.key}
            onClick={() => onViewFilteredHerd?.(item.filterType as any)}
            className="flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-950 rounded-2xl cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <item.icon className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{overview[item.key as keyof HealthBreedingOverview]}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">{item.label}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
