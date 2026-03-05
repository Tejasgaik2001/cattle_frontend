import type { DashboardAlertsProps } from '../types';
import { AlertsCard } from './AlertsCard';
import { MilkProductionCard } from './MilkProductionCard';
import { HerdSnapshotCard } from './HerdSnapshotCard';
import { QuickActions } from './QuickActions';
import { WeeklyMilkTrendCard } from './WeeklyMilkTrendCard';
import { RecentActivityCard } from './RecentActivityCard';

export function DashboardAlerts({
  summary,
  alerts,
  weeklyTrend,
  recentActivity,
  onViewAlertAction,
  onRecordMilk,
  onLogHealthEvent,
  onAddCow,
  onRecordExpense,
}: DashboardAlertsProps) {
  return (
    <div className="space-y-5">
      {/* 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">

        {/* LEFT — Compact Alerts */}
        <div className="xl:col-span-1">
          <AlertsCard
            alerts={alerts}
            onViewAlertAction={onViewAlertAction}
          />
        </div>

        {/* CENTER — Primary Metrics */}
        <div className="xl:col-span-1 space-y-5">
          <MilkProductionCard
            todayMilkTotal={summary.todayMilkTotal}
            yesterdayMilkTotal={summary.yesterdayMilkTotal}
            milkingCowsCount={summary.milkingCowsCount ?? 0}
          />
          <HerdSnapshotCard
            totalHerdSize={summary.totalHerdSize}
            lactatingCowsCount={summary.lactatingCowsCount}
            pregnantCowsCount={summary.pregnantCowsCount}
            cowsUnderTreatmentCount={summary.cowsUnderTreatmentCount}
            youngCattleCount={summary.youngCattleCount ?? 0}
          />
        </div>

        {/* RIGHT — Operational Insights */}
        <div className="xl:col-span-1 space-y-5 md:col-span-2">
          <WeeklyMilkTrendCard data={weeklyTrend} />
          <RecentActivityCard activities={recentActivity} />
        </div>
      </div>

      {/* Quick Actions — full-width below grid */}
      <QuickActions
        onRecordMilk={onRecordMilk}
        onLogHealthEvent={onLogHealthEvent}
        onAddCow={onAddCow}
        onRecordExpense={onRecordExpense}
      />
    </div>
  );
}
