// =============================================================================
// Data Types
// =============================================================================

/** High-level aggregated data for display on the dashboard. */
export interface DashboardSummary {
  totalHerdSize: number;
  lactatingCowsCount: number;
  pregnantCowsCount: number;
  cowsUnderTreatmentCount: number;
  youngCattleCount: number;
  todayMilkTotal: number;
  yesterdayMilkTotal: number;
  milkingCowsCount: number;
}

/** Represents a single critical alert that requires user attention. */
export interface Alert {
  id: string;
  type: 'vaccination_due' | 'health_issue' | 'missing_data';
  title: string;
  message: string;
  cowId: string;
  cowTag?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string; // ISO date string
}

/** A single data point in the weekly milk trend. */
export interface WeeklyMilkPoint {
  date: string;   // e.g. "2026-03-05"
  liters: number;
}

/** A single recent-activity event */
export interface ActivityItem {
  id: string;
  type: 'milk_recorded' | 'treatment_added' | 'vaccination_completed' | 'cow_added' | 'expense_recorded';
  cowTag: string;
  description: string;
  timestamp: string; // ISO date string
}

// =============================================================================
// Component Props
// =============================================================================

export interface DashboardAlertsProps {
  /** The aggregated summary data for the dashboard. */
  summary: DashboardSummary;

  /** The list of critical alerts to display. */
  alerts: Alert[];

  /** Last 7 days of milk totals for the trend chart. */
  weeklyTrend: WeeklyMilkPoint[];

  /** Recent farm activity events. */
  recentActivity: ActivityItem[];

  /** Called when a user taps on an alert to see details. */
  onViewAlertAction?: (alertId: string, cowId: string) => void;

  /** Called when the user wants to record milk for a cow. */
  onRecordMilk?: () => void;

  /** Called when the user wants to log a new health event. */
  onLogHealthEvent?: () => void;

  /** Called when the user wants to add a new cow. */
  onAddCow?: () => void;

  /** Called when the user wants to record an expense. */
  onRecordExpense?: () => void;
}
