import type { DashboardAlertsProps } from '../types';
import { AlertsCard } from './AlertsCard';
import { MilkProductionCard } from './MilkProductionCard';
import { HerdSnapshotCard } from './HerdSnapshotCard';
import { QuickActions } from './QuickActions';

export function DashboardAlerts({
  summary,
  alerts,
  onViewAlertAction,
  onRecordMilk,
  onLogHealthEvent,
  onAddCow,
}: DashboardAlertsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AlertsCard alerts={alerts} onViewAlertAction={onViewAlertAction} />
        </div>
        <div className="space-y-6">
          <MilkProductionCard 
            todayMilkTotal={summary.todayMilkTotal} 
            yesterdayMilkTotal={summary.yesterdayMilkTotal} 
          />
          <HerdSnapshotCard 
            totalHerdSize={summary.totalHerdSize}
            lactatingCowsCount={summary.lactatingCowsCount}
            pregnantCowsCount={summary.pregnantCowsCount}
            cowsUnderTreatmentCount={summary.cowsUnderTreatmentCount}
          />
        </div>
      </div>
      <QuickActions
        onRecordMilk={onRecordMilk}
        onLogHealthEvent={onLogHealthEvent}
        onAddCow={onAddCow}
      />
    </div>
  );
}
